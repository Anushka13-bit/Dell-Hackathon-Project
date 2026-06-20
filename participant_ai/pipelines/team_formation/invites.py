import uuid
from datetime import datetime, timezone
from typing import Optional

from participant_ai.core.schemas import (
    Participant, Team, Invite, InviteDirection, InviteStatus, PSRequirement, SkillVector
)
from participant_ai.pipelines.team_formation.formation import _improvement

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def create_team(leader: Participant, ps_id: str, ps_requirements: dict[str, PSRequirement]) -> Team:
    """Leader creates a new open team for a chosen PS. team_id generated here."""
    req = ps_requirements.get(ps_id)
    if not req:
        raise ValueError(f"Requirement for ps_id {ps_id} not found.")
    
    return Team(
        team_id=str(uuid.uuid4()),
        name=f"Team {req.title}",
        leader_id=leader.id,
        member_ids=[leader.id],
        slots_remaining=max(0, req.team_size - 1),
        is_open=True,
        is_locked=False
    )

def invite_participant(
    team: Team, leader_id: str, participant_id: str, existing_invites: list[Invite] = None
) -> Invite:
    """Leader-initiated invite (Create Team flow)."""
    if team.leader_id != leader_id:
        raise ValueError("Only the team leader can invite participants.")
    if team.slots_remaining <= 0:
        raise ValueError("Team has no slots remaining.")
    if not team.is_open:
        raise ValueError("Team is no longer open for invites.")
    if participant_id in team.member_ids:
        raise ValueError("Participant is already a member of this team.")
    
    if existing_invites:
        for inv in existing_invites:
            if inv.status == InviteStatus.PENDING and inv.team_id == team.team_id and inv.participant_id == participant_id:
                raise ValueError("A pending invite already exists for this participant and team.")

    return Invite(
        invite_id=str(uuid.uuid4()),
        team_id=team.team_id,
        participant_id=participant_id,
        direction=InviteDirection.LEADER_TO_PARTICIPANT,
        initiated_by_id=leader_id,
        status=InviteStatus.PENDING,
        created_at=_now()
    )

def request_to_join(
    team: Team, participant: Participant, existing_invites: list[Invite] = None
) -> Invite:
    """Participant-initiated invite (Join Team flow)."""
    if participant.id in team.member_ids:
        raise ValueError("Participant is already a member of this team.")
    if not team.is_open:
        raise ValueError("Team is no longer open for new requests.")
    if team.slots_remaining <= 0:
        raise ValueError("Team has no slots remaining.")
    
    if existing_invites:
        for inv in existing_invites:
            if inv.status == InviteStatus.PENDING and inv.team_id == team.team_id and inv.participant_id == participant.id:
                raise ValueError("A pending invite already exists for this participant and team.")
                
    return Invite(
        invite_id=str(uuid.uuid4()),
        team_id=team.team_id,
        participant_id=participant.id,
        direction=InviteDirection.PARTICIPANT_TO_LEADER,
        initiated_by_id=participant.id,
        status=InviteStatus.PENDING,
        created_at=_now()
    )

def respond_to_invite(
    invite: Invite, responder_id: str, accept: bool, team: Team, all_invites: list[Invite] = None
) -> tuple[Invite, Optional[Team]]:
    """THE ONLY function that changes team membership."""
    if invite.status != InviteStatus.PENDING:
        raise ValueError("Can only respond to a PENDING invite.")
        
    if invite.direction == InviteDirection.LEADER_TO_PARTICIPANT:
        if responder_id != invite.participant_id:
            raise ValueError("Only the invited participant can respond to this invite.")
    elif invite.direction == InviteDirection.PARTICIPANT_TO_LEADER:
        if responder_id != team.leader_id:
            raise ValueError("Only the team leader can respond to this request.")
            
    if not accept:
        invite.status = InviteStatus.DECLINED
        invite.responded_at = _now()
        return invite, None
        
    # Accepting
    if team.slots_remaining <= 0:
        raise ValueError("Team is already full.")
        
    invite.status = InviteStatus.ACCEPTED
    invite.responded_at = _now()
    
    team.member_ids.append(invite.participant_id)
    team.slots_remaining -= 1
    if team.slots_remaining <= 0:
        team.is_open = False
        
    # Cancel other pending invites for this participant
    if all_invites:
        for other_inv in all_invites:
            if other_inv.invite_id != invite.invite_id and other_inv.status == InviteStatus.PENDING:
                # One team at a time:
                if other_inv.participant_id == invite.participant_id:
                    other_inv.status = InviteStatus.CANCELLED
                # If team is now full, cancel pending invites FOR THIS TEAM SLOT
                if team.slots_remaining == 0 and other_inv.team_id == team.team_id:
                    other_inv.status = InviteStatus.CANCELLED
                    
    return invite, team

def cancel_invite(invite: Invite, canceller_id: str) -> Invite:
    """The initiating side can withdraw a PENDING invite before the other side responds."""
    if invite.status != InviteStatus.PENDING:
        raise ValueError("Can only cancel a PENDING invite.")
    if canceller_id != invite.initiated_by_id:
        raise ValueError("Only the initiator can cancel the invite.")
        
    invite.status = InviteStatus.CANCELLED
    return invite

def lock_team(team: Team, leader_id: str, min_size: int = 1, all_invites: list[Invite] = None) -> Team:
    """Explicit leader action to finalize the team."""
    if team.leader_id != leader_id:
        raise ValueError("Only the team leader can lock the team.")
    if len(team.member_ids) < min_size:
        raise ValueError(f"Team must have at least {min_size} members to be locked.")
        
    team.is_locked = True
    team.is_open = False
    
    if all_invites:
        for inv in all_invites:
            if inv.status == InviteStatus.PENDING and inv.team_id == team.team_id:
                inv.status = InviteStatus.CANCELLED
                
    return team

def suggest_invitees_for_leader(
    team: Team, leader_members: list[Participant], all_unassigned: list[Participant],
    required_vector: SkillVector, all_invites: list[Invite] = None, top_n: int = 5
) -> list[Participant]:
    """Create Team flow, the 'if still under-filled, give suggestions' case."""
    excluded_ids = set(team.member_ids)
    if all_invites:
        for inv in all_invites:
            if inv.team_id == team.team_id and inv.status in (InviteStatus.PENDING, InviteStatus.ACCEPTED):
                excluded_ids.add(inv.participant_id)
                
    valid_candidates = [p for p in all_unassigned if p.id not in excluded_ids]
    
    scored_candidates = []
    for candidate in valid_candidates:
        delta = _improvement(leader_members, candidate, required_vector)
        scored_candidates.append((delta, candidate))
        
    scored_candidates.sort(key=lambda x: x[0], reverse=True)
    return [c for delta, c in scored_candidates[:top_n] if delta > 0]

def suggest_teams_for_participant(
    participant: Participant, open_teams: list[Team],
    all_required_vectors: dict[str, SkillVector],
    all_team_members: dict[str, list[Participant]], all_invites: list[Invite] = None, top_n: int = 5
) -> list[Team]:
    """Join Team flow, the suggestion participants see."""
    excluded_team_ids = set()
    if all_invites:
        for inv in all_invites:
            if inv.participant_id == participant.id and inv.status in (InviteStatus.PENDING, InviteStatus.ACCEPTED):
                excluded_team_ids.add(inv.team_id)
                
    valid_teams = [t for t in open_teams if t.team_id not in excluded_team_ids and t.is_open and t.slots_remaining > 0]
    
    scored_teams = []
    for team in valid_teams:
        members = all_team_members.get(team.team_id, [])
        req_vec = all_required_vectors.get(team.team_id)
        if not req_vec:
            continue
            
        delta = _improvement(members, participant, req_vec)
        scored_teams.append((delta, team))
        
    scored_teams.sort(key=lambda x: x[0], reverse=True)
    return [t for delta, t in scored_teams[:top_n] if delta > 0]

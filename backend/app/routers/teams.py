import uuid
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.team import Team
from ..models.participant import Participant

try:
    from app.services.audit_service import log_event
except ImportError:
    def log_event(*args, **kwargs): pass

router = APIRouter()


# --------------- Pydantic schemas ---------------

class TeamCreate(BaseModel):
    name: str
    member_ids: Optional[List[str]] = []


class TeamOut(BaseModel):
    team_id: uuid.UUID | str
    name: Optional[str] = None
    member_ids: Optional[List[uuid.UUID | str]] = []
    member_count: Optional[int] = None
    max_team_size: Optional[int] = None
    slots_remaining: Optional[int] = None
    coverage_score: Optional[float] = None
    diversity_score: Optional[float] = None
    formation_confidence: Optional[float] = None
    problem_statement: Optional[str] = None

    class Config:
        from_attributes = True


class AddMemberRequest(BaseModel):
    participant_id: str


# --------------- CRUD endpoints ---------------

@router.post("/create", response_model=TeamOut)
async def create_team(data: TeamCreate, db: Session = Depends(get_db)):
    """Create a new team."""
    team = Team(
        team_id=uuid.uuid4(),
        name=data.name,
        member_ids=data.member_ids or [],
    )
    db.add(team)
    db.commit()
    db.refresh(team)

    # Update participants with team_id
    for pid in (data.member_ids or []):
        p = db.query(Participant).filter(Participant.user_id == str(pid)).first()
        if not p:
            p = db.query(Participant).filter(Participant.id == str(pid)).first()
        if p:
            p.team_id = team.team_id
            
    # Calculate baseline scores
    _recalculate_team_metrics(db, team)
            
    db.commit()
    db.refresh(team)

    try:
        log_event(
            db=db,
            event_type="team_created",
            payload={"team_id": str(team.team_id), "name": team.name},
            user_id=None
        )
    except Exception as e:
        db.rollback()
        print(f"Failed to log event: {e}")
    max_team_size = get_max_team_size(db)
    return team_to_out(team, max_team_size, db)


@router.get("/", response_model=List[TeamOut])
async def list_teams(db: Session = Depends(get_db)):
    """List all teams."""
    max_team_size = get_max_team_size(db)
    teams = db.query(Team).all()
    return [team_to_out(team, max_team_size, db) for team in teams]


@router.get("/{team_id}", response_model=TeamOut)
async def get_team(team_id: str, db: Session = Depends(get_db)):
    """Get a team by ID."""
    t = db.query(Team).filter(Team.team_id == team_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")
    return team_to_out(t, get_max_team_size(db), db)


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    problem_statement: Optional[str] = None
    member_ids: Optional[List[str]] = None

@router.put("/{team_id}", response_model=TeamOut)
async def update_team(team_id: str, data: TeamUpdate, db: Session = Depends(get_db)):
    """Update a team."""
    t = db.query(Team).filter(Team.team_id == team_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if data.name is not None:
        t.name = data.name
    if data.problem_statement is not None:
        t.problem_statement = data.problem_statement
    if data.member_ids is not None:
        t.member_ids = data.member_ids
        _recalculate_team_metrics(db, t)
        
    db.commit()
    db.refresh(t)
    return team_to_out(t, get_max_team_size(db), db)

@router.post("/{team_id}/add_member", response_model=TeamOut)
async def add_member(team_id: str, data: AddMemberRequest, db: Session = Depends(get_db)):
    """Add a participant to a team."""
    t = db.query(Team).filter(Team.team_id == team_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")

    current_members = list(t.member_ids or [])
    if data.participant_id in current_members:
        raise HTTPException(status_code=409, detail="Participant already in team")

    current_members.append(data.participant_id)
    t.member_ids = current_members

    # Update participant's team_id
    p = db.query(Participant).filter(Participant.id == data.participant_id).first()
    if p:
        p.team_id = t.team_id
        
    # Calculate baseline scores
    _recalculate_team_metrics(db, t)

    db.commit()

    try:
        log_event(
            db=db,
            event_type="team_member_added",
            payload={"team_id": str(t.team_id), "participant_id": data.participant_id},
            user_id=None
        )
    except Exception as e:
        db.rollback()
        print(f"Failed to log event: {e}")
    return team_to_out(t, get_max_team_size(db), db)


@router.delete("/{team_id}")
async def delete_team(team_id: str, db: Session = Depends(get_db)):
    """Delete a team."""
    t = db.query(Team).filter(Team.team_id == team_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")

    # Clear team_id on participants
    for pid in (t.member_ids or []):
        p = db.query(Participant).filter(Participant.id == pid).first()
        if p:
            p.team_id = None

    db.delete(t)
    db.commit()

    try:
        log_event(
            db=db,
            event_type="team_deleted",
            payload={"team_id": team_id},
            user_id=None
        )
    except Exception as e:
        db.rollback()
        print(f"Failed to log event: {e}")
    return {"detail": "deleted"}

from ..models.invite import Invite, InviteStatus, InviteDirection
from ..models.hackathon import Hackathon

DEFAULT_MAX_TEAM_SIZE = 4


def get_max_team_size(db: Session) -> int:
    hackathon = db.query(Hackathon).order_by(Hackathon.registration_start.desc().nullslast()).first()
    if hackathon and hackathon.max_team_size:
        return hackathon.max_team_size
    return DEFAULT_MAX_TEAM_SIZE


def _recalculate_team_metrics(db: Session, team: Team) -> None:
    """Recalculate team formation metrics when membership changes."""
    member_ids = team.member_ids or []
    if not member_ids:
        team.coverage_score = 0.0
        team.diversity_score = 0.0
        team.formation_confidence = 0.0
        return

    raw_ids = [str(member_id) for member_id in member_ids]
    participants = (
        db.query(Participant)
        .filter((Participant.id.in_(raw_ids)) | (Participant.user_id.in_(raw_ids)))
        .all()
    )
    if not participants:
        return

    from app.services.ai.core.schemas import SkillVector
    from app.services.ai.pipelines.team_formation.formation import team_vector, coverage_score

    member_vectors = []
    for participant in participants:
        raw_sv = participant.skill_vector or {}
        clean_sv = {}
        if isinstance(raw_sv, dict):
            for key, value in raw_sv.items():
                try:
                    clean_sv[key] = float(value)
                except (ValueError, TypeError):
                    pass
        if clean_sv:
            member_vectors.append(SkillVector.from_dict(clean_sv))

    if not member_vectors:
        return

    combined = team_vector(member_vectors)
    required = SkillVector.from_dict(
        {category: 1.0 for category in combined.scores.keys()}
    )
    team.coverage_score = round(coverage_score(combined, required) * 100, 2)
    team.diversity_score = round(min(100.0, len(member_vectors) * 25.0), 2)
    team.formation_confidence = round(
        min(100.0, (team.coverage_score or 0) * 0.7 + (team.diversity_score or 0) * 0.3),
        2,
    )


def get_valid_team_member_ids(db: Session, team: Team) -> list[str]:
    raw_ids = [str(member_id) for member_id in (team.member_ids or [])]
    if not raw_ids:
        return []
    
    participants = db.query(Participant).filter(
        (Participant.id.in_(raw_ids)) | (Participant.user_id.in_(raw_ids))
    ).all()
    
    valid_ids = []
    seen = set()
    for raw_id in raw_ids:
        for p in participants:
            if str(p.id) == raw_id or (p.user_id and str(p.user_id) == raw_id):
                pid = str(p.id)
                if pid not in seen:
                    seen.add(pid)
                    valid_ids.append(pid)
                break
            
    return valid_ids


def build_team_schema(team: Team, max_team_size: int, db: Session):
    from app.services.ai.core.schemas import Team as TeamSchema

    member_ids = get_valid_team_member_ids(db, team)
    return TeamSchema(
        team_id=str(team.team_id),
        name=team.name or "",
        leader_id=member_ids[0] if member_ids else "",
        member_ids=member_ids,
        slots_remaining=max(0, max_team_size - len(member_ids)),
        is_open=len(member_ids) < max_team_size,
        is_locked=False,
    )


def team_to_out(team: Team, max_team_size: int, db: Session) -> "TeamOut":
    member_ids = get_valid_team_member_ids(db, team)
    member_count = len(member_ids)
    return TeamOut(
        team_id=team.team_id,
        name=team.name,
        member_ids=member_ids,
        coverage_score=team.coverage_score,
        diversity_score=team.diversity_score,
        formation_confidence=team.formation_confidence,
        member_count=member_count,
        max_team_size=max_team_size,
        slots_remaining=max(0, max_team_size - member_count),
    )

class InviteRequest(BaseModel):
    participant_id: str
    leader_id: str

class JoinRequest(BaseModel):
    participant_id: str
    participant_email: Optional[str] = None

class InviteRespondRequest(BaseModel):
    responder_id: str
    accept: bool

@router.post("/{team_id}/invite")
async def invite_participant(team_id: str, data: InviteRequest, db: Session = Depends(get_db)):
    """Leader invites a participant to the team."""
    team = db.query(Team).filter(Team.team_id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    try:
        team_schema = build_team_schema(team, get_max_team_size(db), db)
        
        from app.services.ai.pipelines.team_formation.invites import invite_participant as ai_invite
        invite_schema = ai_invite(team_schema, data.leader_id, data.participant_id)
        
        new_invite = Invite(
            id=uuid.UUID(invite_schema.invite_id),
            team_id=team.team_id,
            participant_id=data.participant_id,
            direction=InviteDirection.LEADER_TO_PARTICIPANT,
            initiated_by_id=data.leader_id,
            status=InviteStatus.PENDING
        )
        db.add(new_invite)
        db.commit()
        return {"status": "success", "invite_id": str(new_invite.id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{team_id}/request-join")
async def request_join(team_id: str, data: JoinRequest, db: Session = Depends(get_db)):
    """Participant requests to join a team."""
    team = db.query(Team).filter(Team.team_id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    participant = db.query(Participant).filter(Participant.id == data.participant_id).first()
    if not participant:
        participant = db.query(Participant).filter(Participant.user_id == data.participant_id).first()
    if not participant and data.participant_email:
        participant = db.query(Participant).filter(Participant.email == data.participant_email).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    try:
        from app.services.ai.core.schemas import (
            Participant as ParticipantSchema,
            ParsedResume,
            SkillVector,
        )
        team_schema = build_team_schema(team, get_max_team_size(db), db)

        raw_sv = participant.skill_vector or {}
        clean_sv = {}
        if isinstance(raw_sv, dict):
            for key, value in raw_sv.items():
                try:
                    clean_sv[key] = float(value)
                except (ValueError, TypeError):
                    pass

        participant_schema = ParticipantSchema(
            id=str(participant.id),
            parsed_resume=ParsedResume(
                name=participant.name or "Unknown",
                college_name=participant.college_name or "",
                github_url=participant.github_url or "",
                raw_skills=participant.declared_skills or [],
            ),
            skill_vector=SkillVector.from_dict(clean_sv),
            team_id=str(participant.team_id) if participant.team_id else None,
        )
        
        from app.services.ai.pipelines.team_formation.invites import request_to_join
        invite_schema = request_to_join(team_schema, participant_schema)
        
        new_invite = Invite(
            id=uuid.UUID(invite_schema.invite_id),
            team_id=team.team_id,
            participant_id=str(participant.id),
            direction=InviteDirection.PARTICIPANT_TO_LEADER,
            initiated_by_id=str(participant.id),
            status=InviteStatus.PENDING
        )
        db.add(new_invite)
        db.commit()
        return {"status": "success", "invite_id": str(new_invite.id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/invites/{invite_id}/respond")
async def respond_to_invite(invite_id: str, data: InviteRespondRequest, db: Session = Depends(get_db)):
    """Respond to an invite."""
    invite = db.query(Invite).filter(Invite.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
        
    team = db.query(Team).filter(Team.team_id == invite.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    try:
        from app.services.ai.core.schemas import Invite as InviteSchema
        
        team_schema = build_team_schema(team, get_max_team_size(db), db)
        
        invite_schema = InviteSchema(
            invite_id=str(invite.id),
            team_id=str(invite.team_id),
            participant_id=str(invite.participant_id),
            direction=invite.direction.value,
            initiated_by_id=str(invite.initiated_by_id),
            status=invite.status.value,
            created_at=invite.created_at.isoformat()
        )
        
        from app.services.ai.pipelines.team_formation.invites import respond_to_invite as ai_respond
        updated_inv_schema, updated_team_schema = ai_respond(
            invite=invite_schema,
            responder_id=data.responder_id,
            accept=data.accept,
            team=team_schema
        )
        
        invite.status = InviteStatus(updated_inv_schema.status)
        from datetime import datetime, timezone
        invite.responded_at = datetime.now(timezone.utc)
        
        if updated_team_schema:
            team.member_ids = [uuid.UUID(m) for m in updated_team_schema.member_ids]
            
            # Calculate baseline scores
            _recalculate_team_metrics(db, team)
            
            # Update the participant's team_id
            p = db.query(Participant).filter(Participant.id == str(invite.participant_id)).first()
            if p:
                p.team_id = team.team_id
                
        db.commit()
        return {"status": "success", "invite_status": invite.status.value}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --------------- AI team formation endpoint ---------------

class TeamFormationRequest(BaseModel):
    team_size: int = 4

@router.post("/form")
async def trigger_team_formation(data: TeamFormationRequest):
    """Triggers coverage-driven team assembly as a background Celery task."""
    from app.tasks.team_tasks import team_formation_task
    task = team_formation_task.delay()

    try:
        from ..deps import SessionLocal
        db = SessionLocal()
        log_event(
            db=db,
            event_type="team_formation_triggered",
            payload={"task_id": task.id},
            user_id=None
        )
        db.close()
    except Exception as e:
        print(f"Failed to log event: {e}")

    return {
        "status": "formation_started",
        "message": f"Teams of size {data.team_size} are being formed in the background.",
        "task_id": task.id
    }

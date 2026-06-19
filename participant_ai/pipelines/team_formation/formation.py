"""Team formation — Coverage-Driven Assembly. Importable without GEMINI_API_KEY."""

from __future__ import annotations

import math
import uuid
from typing import Optional

from participant_ai.core.schemas import Participant, PSRequirement, SkillVector, Team
from participant_ai.core.skill_taxonomy import category_names

MIN_IMPROVEMENT = 0.05


def team_vector(member_vectors: list[SkillVector]) -> SkillVector:
    """Element-wise MAX across members, not average."""
    if not member_vectors:
        return SkillVector()
    valid_categories = category_names()
    aggregated = {category: 0.0 for category in valid_categories}
    for vector in member_vectors:
        for category in valid_categories:
            aggregated[category] = max(aggregated[category], vector.scores.get(category, 0.0))
    return SkillVector.from_dict(aggregated)


def coverage_score(team_vec: SkillVector, required_vec: SkillVector) -> float:
    """Coverage-Driven Assembly (PRD Section 10.4).
    coverage_score = sum(min(team_skill, required_skill)) / sum(required_skill)
    """
    valid_categories = category_names()
    sum_required = sum(required_vec.scores.get(c, 0.0) for c in valid_categories)
    if sum_required == 0:
        return 1.0 # If no requirements, we have 100% coverage
        
    sum_covered = sum(
        min(team_vec.scores.get(c, 0.0), required_vec.scores.get(c, 0.0))
        for c in valid_categories
    )
    return sum_covered / sum_required


def _improvement(
    current_members: list[Participant],
    candidate: Participant,
    required_vec: SkillVector,
) -> float:
    before_vecs = [m.skill_vector for m in current_members]
    after_vecs = before_vecs + [candidate.skill_vector]
    return coverage_score(team_vector(after_vecs), required_vec) - coverage_score(
        team_vector(before_vecs), required_vec
    )


def best_fit(
    candidates: list[Participant],
    current_members: list[Participant],
    required_vec: SkillVector,
) -> Participant | None:
    """Return the candidate who most improves team coverage, or None if pool is empty."""
    if not candidates:
        return None
    best: Participant | None = None
    best_delta = float("-inf")
    for candidate in candidates:
        delta = _improvement(current_members, candidate, required_vec)
        if delta > best_delta:
            best_delta = delta
            best = candidate
    return best


def _members_for_team(team: Team, pool_by_id: dict[str, Participant]) -> list[Participant]:
    return [pool_by_id[mid] for mid in team.member_ids if mid in pool_by_id]


def _assign(
    team: Team,
    participant: Participant,
    members: list[Participant],
    required_vec: SkillVector,
    log: list[str],
) -> None:
    before = coverage_score(team_vector([m.skill_vector for m in members]), required_vec)
    team.member_ids.append(participant.id)
    team.slots_remaining = max(0, team.slots_remaining - 1)
    members.append(participant)
    after = coverage_score(team_vector([m.skill_vector for m in members]), required_vec)
    domain = participant.skill_vector.dominant(top_n=1)[0]
    log.append(
        f"{participant.id} -> Team({team.name}): dominant {domain}, coverage {before:.2f}->{after:.2f}"
    )


def form_teams(unassigned: list[Participant], requirements: list[PSRequirement]) -> dict:
    """Coverage-Driven Team Assembly (PRD 10.5).
    
    Creates one team per PSRequirement, and fills it from the unassigned pool
    by greedily maximizing coverage for that specific PS's skill requirements.
    """
    pool: list[Participant] = list(unassigned)
    all_by_id = {p.id: p for p in pool}
    teams: list[Team] = []
    log: list[str] = []
    
    # Track the required_vec for each team by team_id
    team_reqs: dict[str, SkillVector] = {}

    for req in requirements:
        team = Team(
            team_id=str(uuid.uuid4()),
            name=f"Team {req.title}",
            member_ids=[],
            slots_remaining=req.team_size,
        )
        teams.append(team)
        team_reqs[team.team_id] = req.required_vector
        members: list[Participant] = []

        while team.slots_remaining > 0 and pool:
            pick = best_fit(pool, members, req.required_vector)
            if pick is None:
                break
            delta = _improvement(members, pick, req.required_vector)
            if delta < MIN_IMPROVEMENT and len(pool) > team.slots_remaining:
                pass # Still assign if we have slots to fill
            pool.remove(pick)
            _assign(team, pick, members, req.required_vector, log)

    # Second pass: place leftovers on whichever open team they help most
    if pool:
        log.append(f"Second pass: {len(pool)} still unassigned")
    changed = True
    while pool and changed:
        changed = False
        best: Optional[tuple[Team, Participant, float, list[Participant], SkillVector]] = None
        for team in teams:
            if team.slots_remaining <= 0:
                continue
            members = _members_for_team(team, all_by_id)
            req_vec = team_reqs[team.team_id]
            pick = best_fit(pool, members, req_vec)
            if pick is None:
                continue
            delta = _improvement(members, pick, req_vec)
            if best is None or delta > best[2]:
                best = (team, pick, delta, members, req_vec)

        if best is not None and best[2] > 0:
            team, pick, _, members, req_vec = best
            pool.remove(pick)
            _assign(team, pick, members, req_vec, log)
            changed = True
        else:
            if pool:
                log.append("Second pass stopped — no positive improvement remaining")
            break

    return {
        "teams": teams,
        "unassigned": [p.id for p in pool],
        "log": log,
    }


def suggest_team(
    participant: Participant,
    open_teams: list[Team],
    all_members: dict[str, list[Participant]],
    team_reqs: dict[str, SkillVector],
) -> Team | None:
    """Suggest best open team for one incoming participant."""
    best_team: Team | None = None
    best_delta = MIN_IMPROVEMENT

    for team in open_teams:
        if team.slots_remaining <= 0:
            continue
        members = all_members.get(team.team_id, [])
        req_vec = team_reqs.get(team.team_id)
        if not req_vec:
            continue
            
        delta = _improvement(members, participant, req_vec)
        if delta > best_delta:
            best_delta = delta
            best_team = team

    return best_team

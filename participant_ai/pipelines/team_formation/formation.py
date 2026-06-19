"""Team formation — pure math, no LLM. Importable without GEMINI_API_KEY."""

from __future__ import annotations

import math
import uuid
from typing import Optional

from participant_ai.core.schemas import Participant, PSRequirement, SkillVector, Team
from participant_ai.core.skill_taxonomy import category_names

MIN_IMPROVEMENT = 0.05


def team_vector(member_vectors: list[SkillVector]) -> SkillVector:
    """Element-wise MAX across members, not average.

    A team's strength in a domain is its strongest member, not diluted by weaker
    ones. This makes greedy formation naturally diversify: a 2nd ML-heavy person
    adds ~0 once one ML-strong member already maxes that category, so the
    algorithm prefers whoever closes a different gap instead.
    """
    if not member_vectors:
        return SkillVector()
    valid_categories = category_names()
    aggregated = {category: 0.0 for category in valid_categories}
    for vector in member_vectors:
        for category in valid_categories:
            aggregated[category] = max(aggregated[category], vector.scores.get(category, 0.0))
    return SkillVector.from_dict(aggregated)


def diversity_score(team_vec: SkillVector) -> float:
    """Average of the element-wise maximums across all 9 skills. Range [0, 1].
    
    A perfectly diverse team has 1.0 in every single skill category.
    """
    valid_categories = category_names()
    return sum(team_vec.scores.get(c, 0.0) for c in valid_categories) / len(valid_categories)


def _improvement(
    current_members: list[Participant],
    candidate: Participant,
) -> float:
    before_vecs = [m.skill_vector for m in current_members]
    after_vecs = before_vecs + [candidate.skill_vector]
    return diversity_score(team_vector(after_vecs)) - diversity_score(
        team_vector(before_vecs)
    )


def best_fit(
    candidates: list[Participant],
    current_members: list[Participant],
) -> Participant | None:
    """Return the candidate who most improves team diversity, or None if pool is empty."""
    if not candidates:
        return None
    best: Participant | None = None
    best_delta = float("-inf")
    for candidate in candidates:
        delta = _improvement(current_members, candidate)
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
    log: list[str],
) -> None:
    before = diversity_score(team_vector([m.skill_vector for m in members]))
    team.member_ids.append(participant.id)
    team.slots_remaining = max(0, team.slots_remaining - 1)
    members.append(participant)
    after = diversity_score(team_vector([m.skill_vector for m in members]))
    domain = participant.skill_vector.dominant(top_n=1)[0]
    log.append(
        f"{participant.id} -> Team({team.name}): dominant {domain}, {before:.2f}->{after:.2f}"
    )


def form_teams(unassigned: list[Participant], team_size: int, num_teams: int) -> dict:
    """Greedy team formation optimizing purely for internal team skill diversity.

    Caller fetches unassigned pool with one DB query, calls this in memory,
    then batch-writes results. Never touches Gemini or the DB itself.
    """
    pool: list[Participant] = list(unassigned)
    all_by_id = {p.id: p for p in pool}
    teams: list[Team] = []
    log: list[str] = []

    for i in range(num_teams):
        team = Team(
            team_id=str(uuid.uuid4()),
            name=f"Team {i + 1}",
            member_ids=[],
            slots_remaining=team_size,
        )
        teams.append(team)
        members: list[Participant] = []

        while team.slots_remaining > 0 and pool:
            pick = best_fit(pool, members)
            if pick is None:
                break
            delta = _improvement(members, pick)
            if delta < MIN_IMPROVEMENT and len(pool) > team.slots_remaining:
                pass
            pool.remove(pick)
            _assign(team, pick, members, log)

    # Second pass: place leftovers on whichever open team they help most
    if pool:
        log.append(f"Second pass: {len(pool)} still unassigned")
    changed = True
    while pool and changed:
        changed = False
        best: Optional[tuple[Team, Participant, float, list[Participant]]] = None
        for team in teams:
            if team.slots_remaining <= 0:
                continue
            members = _members_for_team(team, all_by_id)
            pick = best_fit(pool, members)
            if pick is None:
                continue
            delta = _improvement(members, pick)
            if best is None or delta > best[2]:
                best = (team, pick, delta, members)

        if best is not None and best[2] > 0:
            team, pick, _, members = best
            pool.remove(pick)
            _assign(team, pick, members, log)
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
) -> Team | None:
    """Suggest best open team for one incoming participant (incremental registration).

    Returns None if no team clears MIN_IMPROVEMENT — caller falls back to batch formation.
    Scores are always relative to one team's gap; no global participant ranking.
    """
    best_team: Team | None = None
    best_delta = MIN_IMPROVEMENT

    for team in open_teams:
        if team.slots_remaining <= 0:
            continue
        members = all_members.get(team.team_id, [])
        delta = _improvement(members, participant)
        if delta > best_delta:
            best_delta = delta
            best_team = team

    return best_team

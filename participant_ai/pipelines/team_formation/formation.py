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


def entropy(distribution: list[float]) -> float:
    """Calculates Shannon entropy for a probability distribution."""
    total = sum(distribution)
    if total == 0:
        return 0.0
    return -sum((p / total) * math.log2(p / total) for p in distribution if p > 0)


def diversity_score(members: list[Participant]) -> float:
    """Diversity score based on PRD: entropy of colleges + entropy of dominant skills."""
    if not members:
        return 0.0
        
    # College Diversity
    colleges = {}
    for m in members:
        c = m.college_name.strip().lower() if getattr(m, 'college_name', None) else "unknown"
        colleges[c] = colleges.get(c, 0) + 1
    
    # Skill Diversity (using dominant skill category)
    skills = {}
    for m in members:
        s = m.skill_vector.dominant(top_n=1)
        dom = s[0] if s else "none"
        skills[dom] = skills.get(dom, 0) + 1
        
    college_entropy = entropy(list(colleges.values()))
    skill_entropy = entropy(list(skills.values()))
    
    # Normalize roughly (max entropy for 4 members is ~2.0)
    return (college_entropy + skill_entropy) / 4.0


def form_teams(unassigned: list[Participant], requirements: list[PSRequirement]) -> dict:
    """Coverage-Driven Team Assembly (PRD 10.5 & 10.6).
    
    Includes Stage 1-3 (Coverage Greedy), Stage 4 (Diversity), and Stage 5 (Local Optimization).
    """
    pool: list[Participant] = list(unassigned)
    all_by_id = {p.id: p for p in pool}
    teams: list[Team] = []
    log: list[str] = []
    
    # Track the required_vec for each team by team_id
    team_reqs: dict[str, SkillVector] = {}
    team_members: dict[str, list[Participant]] = {}

    for req in requirements:
        team = Team(
            team_id=str(uuid.uuid4()),
            name=f"Team {req.title}",
            member_ids=[],
            slots_remaining=req.team_size,
        )
        teams.append(team)
        team_reqs[team.team_id] = req.required_vector
        team_members[team.team_id] = []

        # Stage 2 & 3: Coverage-Driven Candidate Scoring
        while team.slots_remaining > 0 and pool:
            # If multiple candidates give same improvement, diversity should be the tiebreaker
            best_candidates = []
            best_delta = float("-inf")
            
            for candidate in pool:
                delta = _improvement(team_members[team.team_id], candidate, req.required_vector)
                if delta > best_delta + 0.01:
                    best_delta = delta
                    best_candidates = [candidate]
                elif abs(delta - best_delta) <= 0.01:
                    best_candidates.append(candidate)
            
            if not best_candidates:
                break
                
            # Stage 4: Diversity Optimization (Tie Breaker)
            pick = best_candidates[0]
            if len(best_candidates) > 1:
                best_div = -1.0
                for candidate in best_candidates:
                    test_members = team_members[team.team_id] + [candidate]
                    div = diversity_score(test_members)
                    if div > best_div:
                        best_div = div
                        pick = candidate

            if best_delta < MIN_IMPROVEMENT and len(pool) > team.slots_remaining:
                pass # Still assign if we have slots to fill
                
            pool.remove(pick)
            _assign(team, pick, team_members[team.team_id], req.required_vector, log)

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
            members = team_members[team.team_id]
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

    # Stage 5: Local Optimization Pass (Member Swapping)
    log.append("Starting Stage 5: Local Optimization Swap Pass")
    swaps_made = 0
    for i, t1 in enumerate(teams):
        for j, t2 in enumerate(teams):
            if i >= j: continue
            
            req1 = team_reqs[t1.team_id]
            req2 = team_reqs[t2.team_id]
            mem1 = team_members[t1.team_id]
            mem2 = team_members[t2.team_id]
            
            cov1 = coverage_score(team_vector([m.skill_vector for m in mem1]), req1)
            cov2 = coverage_score(team_vector([m.skill_vector for m in mem2]), req2)
            div1 = diversity_score(mem1)
            div2 = diversity_score(mem2)
            
            base_score = cov1 + cov2 + (div1 + div2)*0.3
            
            # Try to swap one member from t1 with one from t2
            best_swap = None
            best_score = base_score
            
            for m1 in mem1:
                for m2 in mem2:
                    test_mem1 = [m for m in mem1 if m.id != m1.id] + [m2]
                    test_mem2 = [m for m in mem2 if m.id != m2.id] + [m1]
                    
                    test_cov1 = coverage_score(team_vector([m.skill_vector for m in test_mem1]), req1)
                    test_cov2 = coverage_score(team_vector([m.skill_vector for m in test_mem2]), req2)
                    test_div1 = diversity_score(test_mem1)
                    test_div2 = diversity_score(test_mem2)
                    
                    test_score = test_cov1 + test_cov2 + (test_div1 + test_div2)*0.3
                    if test_score > best_score + 0.05: # Require meaningful improvement
                        best_score = test_score
                        best_swap = (m1, m2, test_cov1, test_cov2)
            
            if best_swap:
                m1, m2, new_cov1, new_cov2 = best_swap
                # Apply swap
                t1.member_ids.remove(m1.id)
                t1.member_ids.append(m2.id)
                t2.member_ids.remove(m2.id)
                t2.member_ids.append(m1.id)
                mem1.remove(m1)
                mem1.append(m2)
                mem2.remove(m2)
                mem2.append(m1)
                swaps_made += 1
                log.append(f"Swapped {m1.id} (Team {t1.name}) with {m2.id} (Team {t2.name}) -> Coverage improvement")
    
    log.append(f"Completed local optimization. Total swaps: {swaps_made}")

    # Compute Team Formation Confidence Score
    for team in teams:
        mem = team_members[team.team_id]
        cov = coverage_score(team_vector([m.skill_vector for m in mem]), team_reqs[team.team_id])
        div = diversity_score(mem)
        balance = 1.0 # simplified
        confidence = (0.5 * cov) + (0.3 * div) + (0.2 * balance)
        team.formation_confidence = min(confidence, 1.0)
        team.coverage_score = cov
        team.diversity_score = div

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

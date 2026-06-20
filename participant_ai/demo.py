"""End-to-end smoke test. Requires GEMINI_API_KEY for parsing steps."""

from __future__ import annotations

import asyncio
import json
from typing import Any

from participant_ai.db import init_db
from participant_ai.pipelines.problem_statement.parser import parse_ps
from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch
from participant_ai.core.schemas import Participant, Team
from participant_ai.pipelines.team_formation.formation import coverage_score, form_teams, suggest_team, team_vector

PROBLEM_STATEMENTS: list[dict[str, Any]] = [
    {
        "ps_id": "ps-smart-traffic",
        "title": "Smart Traffic Management",
        "raw_text": """
        Build an AI-powered traffic management system using computer vision on live
        camera feeds, a Python/TensorFlow ML pipeline, real-time data ingestion,
        an operator dashboard, and containerized deployment on Kubernetes.
        """,
    },
    {
        "ps_id": "ps-campus-connect",
        "title": "Campus Connect",
        "raw_text": """
        Mobile-first campus social platform: React frontend, Node.js REST API,
        PostgreSQL backend, polished UI/UX, accessible design, React Native for
        iOS and Android, push notifications.
        """,
    },
    {
        "ps_id": "ps-data-insights",
        "title": "Hackathon Analytics Dashboard",
        "raw_text": """
        Data analytics platform with ETL pipelines, SQL warehousing, Python processing,
        interactive charts, Grafana or React dashboard, CI/CD for automated deploys.
        """,
    },
]

RESUMES: list[dict[str, Any]] = [
    {
        "id": "P001",
        "text": "Priya Sharma | IIT Delhi | github.com/priyasharma\nSkills: Python, TensorFlow, OpenCV\nML intern, TrafficSignNet (YOLOv8), MedImageSeg (U-Net)",
    },
    {
        "id": "P002",
        "text": "Arjun Mehta | BITS Pilani\nReact, TypeScript, Next.js, Tailwind, Figma\nFrontend dev — ShopEase, CampusEvents (polished UI)",
    },
    {
        "id": "P003",
        "text": "Sneha Reddy | VIT Vellore\nNode.js, Express, PostgreSQL, Redis, Docker\nREST APIs and microservices for 3 hackathon projects",
    },
    {
        "id": "P004",
        "text": "Karan Patel | NIT Trichy\nReact Native, Flutter, iOS, Android, UI/UX\nFitTrack app, StudyBuddy cross-platform campus app",
    },
    {
        "id": "P005",
        "text": "Ananya Iyer | Anna University | github.com/ananyaiyer\nPython, Pandas, SQL, Spark\nData analyst — SalesETL, Grafana dashboards",
    },
    {
        "id": "P006",
        "text": "Rohit Verma | IIIT Hyderabad\nKubernetes, Docker, Terraform, GitHub Actions\nMLOps deploy pipeline on EKS",
    },
    {
        "id": "P007",
        "text": "Divya Nair | github.com/divyanair\nFastAPI, Python, PyTorch, backend APIs\nSentimentAPI (BERT), ImageClassifier API",
    },
    {
        "id": "P008",
        "text": "Meera Joshi | SRM University\nHTML, CSS, React, Figma, Adobe XD\nDesign system, WCAG-accessible nonprofit redesign",
    },
]

LATE_JOINER: dict[str, Any] = {
    "id": "P_LATE",
    "text": "Vikram Singh | IIT Bombay | github.com/vikramsingh\nPython, OpenCV, TensorFlow, CUDA\nVehicleCounter (YOLO), LaneDetection CNN",
}


async def _build_participants() -> list[Participant]:
    texts = [r["text"] for r in RESUMES]
    triplets = await parse_and_vectorize_batch(texts, max_concurrency=1)
    
    participants = []
    for meta, (parsed, vector, embedding, breakdown) in zip(RESUMES, triplets):
        p = Participant(
            id=meta["id"],
            parsed_resume=parsed,
            skill_vector=vector,
            semantic_embedding=embedding,
        )
        setattr(p, "_breakdown", breakdown)
        participants.append(p)
    return participants


async def _build_late_joiner() -> Participant:
    parsed, vector, embedding, breakdown = (await parse_and_vectorize_batch(
        [LATE_JOINER["text"]], max_concurrency=1
    ))[0]
    return Participant(
        id=LATE_JOINER["id"],
        parsed_resume=parsed,
        skill_vector=vector,
        semantic_embedding=embedding,
    )


def main() -> None:
    print("=== Initialize Database (if available) ===")
    init_db()
    print()

    print("=== Parse problem statements (sync Gemini) ===")
    ps_list = [
        parse_ps(ps["raw_text"], ps["title"], ps["ps_id"])
        for ps in PROBLEM_STATEMENTS
    ]
    for ps in ps_list:
        print(f"{ps.title}: {json.dumps(ps.required_vector.to_dict())}")

    print("\n=== Parse & vectorize resumes (async batch) ===")
    participants = asyncio.run(_build_participants())
    for p in participants:
        print(f"{p.id}: dominant={p.skill_vector.dominant()}")
        breakdown = getattr(p, "_breakdown", {})
        for cat in p.skill_vector.dominant(top_n=2):
            b = breakdown.get(cat, {})
            print(f"  {cat}: keyword={b.get('keyword', 0):.2f} project={b.get('project', 0):.2f} llm={b.get('llm', 0):.2f} -> final={b.get('final', 0):.2f}")

    print("\n=== Form teams (Coverage-Driven Assembly) ===\n")
    # For the demo, use the first two problem statements
    requirements = ps_list[:2]
    # Set max team size to 4 for demo
    for req in requirements:
        req.team_size = 4
        
    formation = form_teams(participants, requirements)
    teams = formation["teams"]
    
    team_reqs = {req.title: req.required_vector for req in requirements}

    for team in teams:
        members = [p for p in participants if p.id in team.member_ids]
        team_vec = team_vector([m.skill_vector for m in members])
        ps_title = team.name.replace("Team ", "")
        req_vec = team_reqs.get(ps_title, team_vec) # fallback
        score = coverage_score(team_vec, req_vec)
        print(f"Team {team.team_id[:8]}... | {team.name}")
        print(f"  Members: {team.member_ids}")
        print(f"  Coverage Score: {score:.3f} | Slots left: {team.slots_remaining}\n")

    print("\nLog:")
    for line in formation["log"]:
        print(f"  {line}")
    if formation["unassigned"]:
        print(f"\nUnassigned: {formation['unassigned']}")

    print("=== Suggest team for late joiner ===")
    late_joiner = asyncio.run(_build_late_joiner())
    # Group participants by team_id for the suggest function
    all_members = {}
    for t in teams:
        all_members[t.team_id] = [p for p in participants if p.id in t.member_ids]
        
    team_reqs_by_id = {t.team_id: team_reqs.get(t.name.replace("Team ", "")) for t in teams}
        
    suggestion = suggest_team(
        late_joiner,
        open_teams=teams,
        all_members=all_members,
        team_reqs=team_reqs_by_id,
    )
    if suggestion:
        print(f"{late_joiner.id} -> Team({suggestion.name}) [{suggestion.team_id[:8]}...]")
    else:
        print(f"{late_joiner.id} -> No open team found")

    print("\n" + "="*50)
    print("=== MANUAL TEAM FORMATION (INVITES & REQUESTS) ===")
    from participant_ai.pipelines.team_formation.invites import (
        create_team, invite_participant, request_to_join, respond_to_invite, lock_team,
        suggest_invitees_for_leader, suggest_teams_for_participant
    )
    from participant_ai.core.schemas import InviteStatus
    
    leader = participants[0]
    p_invitee1 = participants[1]
    p_invitee2 = participants[2]
    p_suggestion = participants[3]
    p_joiner = participants[4]
    
    all_invites = []
    
    # 1. Create Team flow
    print("\n--- 1. Create Team Flow ---")
    ps = ps_list[0]
    reqs_dict = {ps.ps_id: ps}
    team_manual = create_team(leader, ps.ps_id, reqs_dict)
    print(f"Leader {leader.id} created Team: {team_manual.name} (Slots remaining: {team_manual.slots_remaining})")
    
    inv1 = invite_participant(team_manual, leader.id, p_invitee1.id, all_invites)
    all_invites.append(inv1)
    inv2 = invite_participant(team_manual, leader.id, p_invitee2.id, all_invites)
    all_invites.append(inv2)
    print(f"Leader invited {p_invitee1.id} and {p_invitee2.id}. Invites pending.")
    
    inv1, updated_team = respond_to_invite(inv1, p_invitee1.id, accept=True, team=team_manual, all_invites=all_invites)
    print(f"{p_invitee1.id} accepted. Team members: {updated_team.member_ids}")
    
    inv2, updated_team = respond_to_invite(inv2, p_invitee2.id, accept=True, team=team_manual, all_invites=all_invites)
    print(f"{p_invitee2.id} accepted. Team members: {updated_team.member_ids}")
    
    print("\nLeader requests suggestions for remaining slots...")
    unassigned_for_demo = [p_suggestion, p_joiner]
    leader_members = [leader, p_invitee1, p_invitee2]
    suggestions = suggest_invitees_for_leader(
        team_manual, leader_members, unassigned_for_demo, ps.required_vector, all_invites, top_n=2
    )
    for s in suggestions:
        print(f"  Suggested: {s.id}")
        
    top_suggestion = suggestions[0]
    inv3 = invite_participant(team_manual, leader.id, top_suggestion.id, all_invites)
    all_invites.append(inv3)
    print(f"Leader invited top suggestion {top_suggestion.id}.")
    
    inv3, updated_team = respond_to_invite(inv3, top_suggestion.id, accept=True, team=team_manual, all_invites=all_invites)
    print(f"{top_suggestion.id} accepted. Team members: {updated_team.member_ids}")
    
    locked_team = lock_team(updated_team, leader.id, min_size=1, all_invites=all_invites)
    print(f"Leader locked the team. is_open={locked_team.is_open}, is_locked={locked_team.is_locked}")
    
    # 2. Join Team flow
    print("\n--- 2. Join Team Flow ---")
    ps2 = ps_list[1]
    team_open = create_team(participants[5], ps2.ps_id, {ps2.ps_id: ps2})
    print(f"Another Leader {participants[5].id} created open Team: {team_open.name}")
    
    open_teams = [locked_team, team_open]
    all_req_vecs = {
        locked_team.team_id: ps.required_vector,
        team_open.team_id: ps2.required_vector
    }
    all_team_members = {
        locked_team.team_id: [p for p in participants if p.id in locked_team.member_ids],
        team_open.team_id: [p for p in participants if p.id in team_open.member_ids]
    }
    
    print(f"Participant {p_joiner.id} requests suggestions for teams to join...")
    join_suggestions = suggest_teams_for_participant(
        p_joiner, open_teams, all_req_vecs, all_team_members, all_invites, top_n=2
    )
    for t in join_suggestions:
        print(f"  Suggested Team: {t.name}")
        
    if join_suggestions:
        top_team = join_suggestions[0]
        join_req = request_to_join(top_team, p_joiner, all_invites)
        all_invites.append(join_req)
        print(f"Participant {p_joiner.id} requested to join {top_team.name}.")
        
        join_req, joined_team = respond_to_invite(join_req, top_team.leader_id, accept=True, team=top_team, all_invites=all_invites)
        print(f"Leader {top_team.leader_id} accepted the request! Team members: {joined_team.member_ids}")
        
    print("\nFinal Invite Statuses:")
    for inv in all_invites:
        print(f"  Invite {inv.invite_id[:8]} | Dir: {inv.direction.value} | Status: {inv.status.value}")


if __name__ == "__main__":
    main()

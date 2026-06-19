"""End-to-end smoke test. Requires GEMINI_API_KEY for parsing steps."""

from __future__ import annotations

import asyncio
import json
from typing import Any

from participant_ai.db import init_db
from participant_ai.pipelines.problem_statement.parser import parse_ps
from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch
from participant_ai.core.schemas import Participant, Team
from participant_ai.pipelines.team_formation.formation import diversity_score, form_teams, suggest_team, team_vector

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
    for meta, (parsed, vector, breakdown) in zip(RESUMES, triplets):
        p = Participant(
            id=meta["id"],
            parsed_resume=parsed,
            skill_vector=vector,
        )
        setattr(p, "_breakdown", breakdown)
        participants.append(p)
    return participants


async def _build_late_joiner() -> Participant:
    parsed, vector, breakdown = (await parse_and_vectorize_batch(
        [LATE_JOINER["text"]], max_concurrency=1
    ))[0]
    return Participant(
        id=LATE_JOINER["id"],
        parsed_resume=parsed,
        skill_vector=vector,
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

    print("\n=== Form teams (pure math, diversity maximized) ===\n")
    formation = form_teams(participants, team_size=4, num_teams=2)
    teams = formation["teams"]

    for team in teams:
        members = [p for p in participants if p.id in team.member_ids]
        team_vec = team_vector([m.skill_vector for m in members])
        score = diversity_score(team_vec)
        print(f"Team {team.team_id[:8]}... | {team.name}")
        print(f"  Members: {team.member_ids}")
        print(f"  Diversity Score: {score:.3f} | Slots left: {team.slots_remaining}\n")

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
        
    suggestion = suggest_team(
        late_joiner,
        open_teams=teams,
        all_members=all_members,
    )
    if suggestion:
        print(f"{late_joiner.id} -> Team({suggestion.name}) [{suggestion.team_id[:8]}...]")
    else:
        print(f"{late_joiner.id} -> No open team found")


if __name__ == "__main__":
    main()

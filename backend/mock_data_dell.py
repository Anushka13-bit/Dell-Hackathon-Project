import uuid
from datetime import datetime, timezone
from app.deps import SessionLocal
from app.models.team import Team
from app.models.idea_submission import IdeaSubmission
from app.models.assignment import Assignment
from app.models.reviewer import Reviewer

db = SessionLocal()

hackathon_id = "f32092f2-4f94-4e33-bba2-eaa51c656faa"

# Pick some reviewers
reviewers = db.query(Reviewer).all()
anushka = next((r for r in reviewers if "anushka" in r.name.lower()), reviewers[0])
rahul = next((r for r in reviewers if "rahul" in r.name.lower()), reviewers[0])
priya = next((r for r in reviewers if "priya" in r.name.lower()), reviewers[0])

selected_reviewers = [anushka, rahul, priya]

print("Selected reviewers:", [r.name for r in selected_reviewers])

mock_teams = [
    {"name": "Team Quantum Leap", "description": "Edge computing solution for smart cities using quantum algorithms.", "title": "QuantumEdge"},
    {"name": "Team SynthMind", "description": "Generative AI platform for creating synthetic training data for autonomous vehicles.", "title": "SynthDrive"},
    {"name": "Team GreenGrid", "description": "Smart grid optimization system using IoT sensors and machine learning.", "title": "EcoGrid AI"}
]

for i, mock in enumerate(mock_teams):
    team_id = uuid.uuid4()
    idea_id = uuid.uuid4()
    assignment_id = uuid.uuid4()

    new_team = Team(
        team_id=team_id,
        name=mock["name"],
        member_ids=[],
        coverage_score=88.0,
        diversity_score=92.0,
        formation_confidence=96.0
    )
    db.add(new_team)
    
    new_idea = IdeaSubmission(
        idea_id=idea_id,
        team_id=team_id,
        ps_id=None,
        title=mock["title"],
        description=mock["description"],
        status="submitted",
        idea_vector=[],
        submitted_at=datetime.now(timezone.utc)
    )
    db.add(new_idea)
    db.commit()

    reviewer = selected_reviewers[i % len(selected_reviewers)]

    new_assignment = Assignment(
        assignment_id=assignment_id,
        reviewer_id=reviewer.reviewer_id,
        idea_id=idea_id,
        hackathon_id=hackathon_id,
        compatibility_score=85.0 + i,
        explanation={"reason": "Mock assignment for testing."},
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_assignment)
    db.commit()

print("Mock data for Dell FutureMinds 2026 generated successfully!")

import uuid
import sys
from datetime import datetime, timezone
from app.deps import SessionLocal
from app.models.team import Team
from app.models.idea_submission import IdeaSubmission
from app.models.assignment import Assignment
from app.models.reviewer import Reviewer

db = SessionLocal()

# Target Hackathon
hackathon_id = "0c663833-96c4-44ef-8c68-f2a3bd9c06b4"

reviewers = db.query(Reviewer).all()
if not reviewers:
    print("No reviewers found in DB.")
    sys.exit()

reviewer_id = "bf80d301-e847-4bb5-80ff-aa3c2094d2d4" # Hardcode or fallback
matching = [r for r in reviewers if str(r.reviewer_id) == reviewer_id]
if not matching:
    reviewer_id = reviewers[0].reviewer_id

print(f"Creating mock data for reviewer {reviewer_id}")

mock_teams = [
    {"name": "Team TechTitans", "description": "A comprehensive healthcare platform leveraging AI for early diagnosis.", "title": "HealthScan AI"},
    {"name": "Team DataGeeks", "description": "Blockchain based voting system ensuring complete transparency and anonymity.", "title": "BlockVote"},
    {"name": "Team CloudNative", "description": "Serverless application for real-time traffic prediction using crowd-sourced data.", "title": "TrafficSense"}
]

for mock in mock_teams:
    team_id = uuid.uuid4()
    idea_id = uuid.uuid4()
    assignment_id = uuid.uuid4()

    new_team = Team(
        team_id=team_id,
        name=mock["name"],
        member_ids=[],
        coverage_score=85.5,
        diversity_score=90.0,
        formation_confidence=95.0
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

    new_assignment = Assignment(
        assignment_id=assignment_id,
        reviewer_id=reviewer_id,
        idea_id=idea_id,
        hackathon_id=hackathon_id,
        compatibility_score=90.0,
        explanation={"reason": "mock data"},
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_assignment)
    db.commit()

print("Mock data generated successfully!")

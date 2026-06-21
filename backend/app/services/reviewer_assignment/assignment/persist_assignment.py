import uuid

from app.models import Assignment
from datetime import datetime
from app.services.reviewer_assignment.db.assignment_repository import (
    save_assignments_bulk
)

from app.services.reviewer_assignment.assignment.assignment_service import (
    generate_assignments
)


from app.deps import SessionLocal
from app.models.idea_submission import IdeaSubmission
from app.models.team import Team

def persist_assignments(provided_hackathon_id=None):

    generated = (
        generate_assignments()
    )

    db_assignments = []
    
    db = SessionLocal()

    for item in generated:
        idea_id = item["submission"].idea_id
        hackathon_id = provided_hackathon_id
        
        # Look up hackathon_id if not provided
        if not hackathon_id:
            sub = db.query(IdeaSubmission).filter(IdeaSubmission.idea_id == idea_id).first()
            if sub and sub.team_id:
                team = db.query(Team).filter(Team.team_id == sub.team_id).first()
                if team:
                    hackathon_id = team.hackathon_id

        db_assignments.append(

            Assignment(
                assignment_id=uuid.uuid4(),
                idea_id=idea_id,
                hackathon_id=hackathon_id,
                reviewer_id=item["reviewer"].reviewer_id,
                compatibility_score=item["score"],
                explanation=[
                    f"Compatibility score: {item['score']}",
                    f"Reviewer specialization: {item['reviewer'].primary_specialization}",
                    "Assigned using Min-Cost Flow optimization"
                ],
                created_at=datetime.utcnow()
            )
        )
        
    db.close()

    save_assignments_bulk(
        db_assignments
    )

    return db_assignments


if __name__ == "__main__":

    persist_assignments()

    print(
        "Assignments saved"
    )
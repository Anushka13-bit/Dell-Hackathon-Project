from app.deps import SessionLocal
from app.models.idea_submission import IdeaSubmission
from app.models.team import Team

def get_hackathon_id(idea_id: str):
    db = SessionLocal()
    sub = db.query(IdeaSubmission).filter(IdeaSubmission.idea_id == idea_id).first()
    if sub and sub.team_id:
        team = db.query(Team).filter(Team.team_id == sub.team_id).first()
        if team:
            return team.hackathon_id
    return None

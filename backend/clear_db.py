from app.deps import SessionLocal
from app.models.team import Team
from app.models.hackathon import Hackathon
from app.models.participant import Participant
from app.models.submission import Submission
from app.models.evaluation import Evaluation

db = SessionLocal()

try:
    # Clear evaluations first
    evals = db.query(Evaluation).delete()
    
    # Clear submissions
    subs = db.query(Submission).delete()
    
    # Nullify participant team_ids
    participants = db.query(Participant).update({"team_id": None})
    
    # Delete teams
    teams = db.query(Team).delete()
    
    # Delete hackathons
    hacks = db.query(Hackathon).delete()
    
    db.commit()
    print(f"Cleared! Evaluatons: {evals}, Submissions: {subs}, Participants updated: {participants}, Teams deleted: {teams}, Hackathons deleted: {hacks}")
except Exception as e:
    import traceback
    traceback.print_exc()
    db.rollback()


from app.deps import SessionLocal
from app.models.assignment import Assignment
from app.models.hackathon import Hackathon

db = SessionLocal()
h = db.query(Hackathon).filter(Hackathon.name == "ttt").first()
if h:
    assignments = db.query(Assignment).filter(Assignment.hackathon_id == h.id).all()
    print(f"Total assignments: {len(assignments)}")

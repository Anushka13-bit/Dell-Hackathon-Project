from app.deps import SessionLocal
from app.models.assignment import Assignment

db = SessionLocal()
assignments = db.query(Assignment).all()
print(f"Total assignments globally: {len(assignments)}")
for a in assignments:
    print(f"Assignment ID: {a.assignment_id}, Hackathon ID: {a.hackathon_id}")

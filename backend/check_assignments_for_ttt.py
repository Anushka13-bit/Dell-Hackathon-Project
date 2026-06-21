from app.deps import SessionLocal
from app.models.assignment import Assignment

db = SessionLocal()
assignments = db.query(Assignment).filter(Assignment.hackathon_id == '91404ccc-fd32-494f-9677-287d0bd620e3').all()
print(f"Total assignments: {len(assignments)}")
for a in assignments:
    print(f"Assignment ID: {a.assignment_id}, Reviewer ID: {a.reviewer_id}, Idea ID: {a.idea_id}")

from app.deps import SessionLocal
from app.models.assignment import Assignment
from app.models.reviewer import Reviewer

db = SessionLocal()
hackathon_id = "91404ccc-fd32-494f-9677-287d0bd620e3"
assignments = db.query(Assignment).filter(Assignment.hackathon_id == hackathon_id).all()
reviewer_ids = {a.reviewer_id for a in assignments}

print("Emails of reviewers assigned to ttt hackathon:")
for r_id in reviewer_ids:
    r = db.query(Reviewer).filter(Reviewer.reviewer_id == r_id).first()
    if r:
        print(f"- {r.name}: {r.email}")

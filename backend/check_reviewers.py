from app.deps import SessionLocal
from app.models.assignment import Assignment
from app.models.reviewer import Reviewer
from app.models.hackathon import Hackathon

db = SessionLocal()

hackathon_id = "f32092f2-4f94-4e33-bba2-eaa51c656faa"

h = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
if not h:
    print("Hackathon not found.")
else:
    print(f"Hackathon: {h.name}")

# Get all unique reviewer IDs from assignments for this hackathon
assignments = db.query(Assignment).filter(Assignment.hackathon_id == hackathon_id).all()
reviewer_ids = set(a.reviewer_id for a in assignments if a.reviewer_id)

reviewers = db.query(Reviewer).filter(Reviewer.reviewer_id.in_(reviewer_ids)).all()

print(f"\nReviewers with assignments in {h.name if h else 'this hackathon'}:")
for r in reviewers:
    # count assignments for this reviewer in this hackathon
    count = sum(1 for a in assignments if a.reviewer_id == r.reviewer_id)
    print(f"- {r.name} (Email: {r.email}, ID: {r.reviewer_id}) - {count} assignment(s)")


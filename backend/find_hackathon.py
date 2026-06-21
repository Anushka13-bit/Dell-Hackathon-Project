from app.deps import SessionLocal
from app.models.hackathon import Hackathon
from app.models.reviewer import Reviewer

db = SessionLocal()

hackathons = db.query(Hackathon).all()
for h in hackathons:
    print(f"Hackathon: {h.name} (ID: {h.id})")
    
print("---")
reviewers = db.query(Reviewer).all()
for r in reviewers:
    print(f"Reviewer: {r.name} (ID: {r.reviewer_id})")


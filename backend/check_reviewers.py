from app.deps import SessionLocal
from app.models.reviewer import Reviewer

db = SessionLocal()
reviewers = db.query(Reviewer).all()
print(f"Number of reviewers in DB: {len(reviewers)}")
for r in reviewers:
    print(r.name, r.email)

from app.deps import SessionLocal
from app.models.reviewer import Reviewer

db = SessionLocal()

reviewers = db.query(Reviewer).all()
print("All Reviewers in Database:")
for r in reviewers:
    print(f"- {r.name} -> Email: {r.email if r.email else '(No email set)'}")


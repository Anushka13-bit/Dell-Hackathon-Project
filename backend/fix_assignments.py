from app.deps import SessionLocal
from app.models.evaluation import Evaluation
from app.models.assignment import Assignment

db = SessionLocal()
evals = db.query(Evaluation).all()
count = 0
for e in evals:
    if e.assignment_id:
        assignment = db.query(Assignment).filter(Assignment.assignment_id == e.assignment_id).first()
        if assignment and assignment.status != "REVIEWED":
            assignment.status = "REVIEWED"
            count += 1
db.commit()
print(f"Fixed {count} assignments!")

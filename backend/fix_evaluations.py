from app.deps import SessionLocal
from app.models.evaluation import Evaluation

db = SessionLocal()
hackathon_id = "91404ccc-fd32-494f-9677-287d0bd620e3"
evals = db.query(Evaluation).filter(Evaluation.hackathon_id == None).all()
count = 0
for e in evals:
    e.hackathon_id = hackathon_id
    count += 1
db.commit()
print(f"Fixed {count} evaluations!")

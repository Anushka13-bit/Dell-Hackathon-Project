from app.deps import SessionLocal
from sqlalchemy import text

db = SessionLocal()

tables_to_clear = [
    "evaluations",
    "idea_submissions",
    "assignments",
    "problem_statements",
    "teams",
    "hackathons",
    "invites",
    "normalised_scores",
    "ranking_confidences",
    "reviewer_stats",
    "bias_alerts",
    "fairness_reports"
]

# Nullify participant team_ids and hackathon_ids first
db.execute(text("UPDATE participants SET team_id = NULL"))

for table in tables_to_clear:
    try:
        db.execute(text(f"TRUNCATE TABLE {table} CASCADE;"))
        print(f"Cleared table: {table}")
    except Exception as e:
        print(f"Error on {table}: {e}")
        db.rollback()
        
db.commit()
print("Database data cleared.")

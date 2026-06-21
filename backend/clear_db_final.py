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
    "reviewer_stats",
    "bias_alerts",
    "fairness_reports"
]

try:
    # Nullify participant team_ids and hackathon_ids first
    db.execute(text("UPDATE participants SET team_id = NULL"))
    
    for table in tables_to_clear:
        # Use single transactions for each to prevent one failure rolling back everything
        db.execute(text(f"TRUNCATE TABLE {table} CASCADE;"))
        print(f"Cleared table: {table}")
        
    db.commit()
    print("Database data cleared.")
except Exception as e:
    import traceback
    traceback.print_exc()
    db.rollback()


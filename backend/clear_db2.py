from app.deps import SessionLocal
from sqlalchemy import text

db = SessionLocal()

try:
    # Disable foreign key checks for PostgreSQL or handle tables explicitly.
    # We will just TRUNCATE the tables or delete from them in order if we know them.
    # Let's get the tables we need to clear.
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
            # Maybe table doesn't exist
            pass
            
    db.commit()
    print("Database data cleared.")
except Exception as e:
    import traceback
    traceback.print_exc()
    db.rollback()


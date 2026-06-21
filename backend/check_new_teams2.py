from app.deps import SessionLocal
from app.models.team import Team

db = SessionLocal()
teams = db.query(Team).all()
print(f"Total teams: {len(teams)}")

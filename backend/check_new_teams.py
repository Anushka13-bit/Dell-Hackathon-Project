from app.deps import SessionLocal
from app.models.team import Team
from app.models.participant import Participant

db = SessionLocal()
teams = db.query(Team).all()
print(f"Total teams: {len(teams)}")
for t in teams:
    print(f"Team {t.team_id}: {t.member_ids}")
    for mid in t.member_ids:
        p = db.query(Participant).filter(Participant.id == str(mid)).first()
        p2 = db.query(Participant).filter(Participant.user_id == str(mid)).first()
        print(f"  {mid} -> p_id:{p is not None}, p_uid:{p2 is not None}")


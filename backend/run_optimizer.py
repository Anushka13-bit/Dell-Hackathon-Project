import requests
from app.deps import SessionLocal
from app.models.hackathon import Hackathon

db = SessionLocal()
h = db.query(Hackathon).filter(Hackathon.name == "ttt").first()
if h:
    print(f"Triggering optimizer for Hackathon {h.id}...")
    res = requests.post("http://127.0.0.1:8000/assignments/generate", json={"hackathon_id": str(h.id)})
    print(res.status_code, res.text)
else:
    print("Hackathon not found.")

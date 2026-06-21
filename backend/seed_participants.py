import uuid
from app.deps import SessionLocal
from app.models.participant import Participant

db = SessionLocal()

participants_data = [
    {"name": "Anushka", "email": "anushka@example.com", "declared_skills": ["Python", "AI", "Data Science"]},
    {"name": "Rahul", "email": "rahul@example.com", "declared_skills": ["React", "TypeScript", "Frontend"]},
    {"name": "Sarah", "email": "sarah@example.com", "declared_skills": ["UX/UI", "Figma", "Design"]},
    {"name": "John", "email": "john@example.com", "declared_skills": ["Backend", "PostgreSQL", "Node.js"]},
]

for pdata in participants_data:
    p = Participant(
        id=str(uuid.uuid4()),
        user_id=uuid.uuid4(),
        name=pdata["name"],
        email=pdata["email"],
        declared_skills=pdata["declared_skills"],
        skill_vector={"python": 0.9, "ai": 0.8},
        status="active"
    )
    db.add(p)

db.commit()
print("Mock participants created!")

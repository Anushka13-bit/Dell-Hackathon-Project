import uuid
from uuid import UUID
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.reviewer import Reviewer

from typing import Any

router = APIRouter()


# --------------- Pydantic schemas ---------------

class ReviewerCreate(BaseModel):
    name: str
    resume_text: Optional[str] = None
    skills_json: Optional[dict] = None
    skill_vector: Optional[dict] = None
    primary_specialization: Optional[str] = None
    secondary_specializations: Optional[list] = None



class ReviewerOut(BaseModel):
    reviewer_id: UUID
    name: str
    resume_text: Optional[str] = None

    skills_json: Optional[Any] = None

    skill_vector: Optional[dict] = None
    primary_specialization: Optional[str] = None
    secondary_specializations: Optional[list] = None

    current_load: Optional[int] = 0

    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


import io
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form

# --------------- CRUD endpoints ---------------

@router.post("/register", response_model=ReviewerOut)
async def register_reviewer(
    name: str = Form(...),
    primary_specialization: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Register a new reviewer. Resume skill parsing runs in background via Celery."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for resumes")

    try:
        import pypdf
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the PDF")

    reviewer_id = uuid.uuid4()
    reviewer = Reviewer(
    reviewer_id=reviewer_id,
    name=name,
    resume_text=text,

    skills_json=[],
    skill_vector={},

    primary_specialization=primary_specialization,
    secondary_specializations=[],

    current_load=0,
    created_at=datetime.now(timezone.utc),
)
    db.add(reviewer)
    db.commit()
    db.refresh(reviewer)
    
    # Dispatch heavy LLM resume parsing to Celery background worker
    from app.tasks.resume_tasks import parse_reviewer_resume
    parse_reviewer_resume.delay(str(reviewer_id), text)

    return reviewer


@router.get("/", response_model=List[ReviewerOut])
async def list_reviewers(db: Session = Depends(get_db)):
    """List all reviewers."""
    return db.query(Reviewer).all()


@router.get("/{reviewer_id}", response_model=ReviewerOut)
async def get_reviewer(reviewer_id: str, db: Session = Depends(get_db)):
    """Get a reviewer by ID."""
    r = db.query(Reviewer).filter(Reviewer.reviewer_id == reviewer_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    return r


@router.put("/{reviewer_id}", response_model=ReviewerOut)
async def update_reviewer(reviewer_id: str, data: ReviewerCreate, db: Session = Depends(get_db)):
    """Update a reviewer's details."""
    r = db.query(Reviewer).filter(Reviewer.reviewer_id == reviewer_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reviewer not found")

    r.name = data.name
    r.resume_text = data.resume_text
    r.skills_json = data.skills_json
    r.skill_vector = data.skill_vector
    r.primary_specialization = data.primary_specialization
    r.secondary_specializations = data.secondary_specializations
    db.commit()
    db.refresh(r)
    return r


@router.delete("/{reviewer_id}")
async def delete_reviewer(reviewer_id: str, db: Session = Depends(get_db)):
    """Delete a reviewer."""
    r = db.query(Reviewer).filter(Reviewer.reviewer_id == reviewer_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    db.delete(r)
    db.commit()
    return {"detail": "deleted"}

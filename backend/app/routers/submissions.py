import uuid
from uuid import UUID
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.idea_submission import IdeaSubmission

router = APIRouter()


# --------------- Pydantic schemas ---------------

class SubmissionCreate(BaseModel):
    team_id: str
    ps_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    idea_vector: Optional[dict] = None


class SubmissionOut(BaseModel):
    idea_id: UUID
    team_id: Optional[UUID] = None
    ps_id: Optional[UUID] = None

    title: Optional[str] = None
    description: Optional[str] = None
    idea_vector: Optional[dict] = None

    submitted_at: Optional[datetime] = None

    status: Optional[str] = None
    ai_feedback: Optional[str] = None

    class Config:
        from_attributes = True


# --------------- CRUD endpoints ---------------

@router.post("/", response_model=SubmissionOut)
async def create_submission(data: SubmissionCreate, db: Session = Depends(get_db)):
    """Create a new idea submission for a team."""
    submission = IdeaSubmission(
        idea_id=uuid.uuid4(),
        team_id=data.team_id,
        ps_id=data.ps_id,
        title=data.title,
        description=data.description,
        idea_vector=data.idea_vector,
        submitted_at=datetime.now(timezone.utc),
        status="submitted",
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/", response_model=List[SubmissionOut])
async def list_submissions(db: Session = Depends(get_db)):
    """List all submissions."""
    return db.query(IdeaSubmission).all()


@router.get("/team/{team_id}", response_model=List[SubmissionOut])
async def get_submissions_by_team(team_id: str, db: Session = Depends(get_db)):
    """Get all submissions for a specific team."""
    return db.query(IdeaSubmission).filter(IdeaSubmission.team_id == team_id).all()


@router.get("/{idea_id}", response_model=SubmissionOut)
async def get_submission(idea_id: str, db: Session = Depends(get_db)):
    """Get a submission by ID."""
    s = db.query(IdeaSubmission).filter(IdeaSubmission.idea_id == idea_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    return s


@router.put("/{idea_id}/status")
async def update_submission_status(idea_id: str, status: str, db: Session = Depends(get_db)):
    """Update the status of a submission."""
    s = db.query(IdeaSubmission).filter(IdeaSubmission.idea_id == idea_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    s.status = status
    db.commit()
    return {"detail": "status updated", "status": status}


@router.delete("/{idea_id}")
async def delete_submission(idea_id: str, db: Session = Depends(get_db)):
    """Delete a submission."""
    s = db.query(IdeaSubmission).filter(IdeaSubmission.idea_id == idea_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    db.delete(s)
    db.commit()
    return {"detail": "deleted"}

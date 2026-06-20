import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.assignment import Assignment
from ..models.reviewer import Reviewer

router = APIRouter()


# --------------- Pydantic schemas ---------------

class AssignmentCreate(BaseModel):
    idea_id: str
    reviewer_id: str
    compatibility_score: Optional[float] = None
    explanation: Optional[dict] = None


class AssignmentOut(BaseModel):
    assignment_id: str
    idea_id: Optional[str] = None
    reviewer_id: Optional[str] = None
    compatibility_score: Optional[float] = None
    explanation: Optional[dict] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# --------------- CRUD endpoints ---------------

@router.post("/assign", response_model=AssignmentOut)
async def create_assignment(data: AssignmentCreate, db: Session = Depends(get_db)):
    """Assign a reviewer to an idea submission manually."""
    assignment = Assignment(
        assignment_id=uuid.uuid4(),
        idea_id=data.idea_id,
        reviewer_id=data.reviewer_id,
        compatibility_score=data.compatibility_score,
        explanation=data.explanation,
        created_at=datetime.now(timezone.utc),
    )
    db.add(assignment)

    # Increment reviewer load
    reviewer = db.query(Reviewer).filter(Reviewer.reviewer_id == data.reviewer_id).first()
    if reviewer:
        reviewer.current_load = (reviewer.current_load or 0) + 1

    db.commit()
    db.refresh(assignment)
    return assignment


@router.post("/generate")
def generate_assignments():
    """Runs the complete reviewer assignment pipeline (min-cost flow optimization) and persists assignments."""
    from backend.app.services.reviewer_assignment.assignment.persist_assignment import persist_assignments
    
    try:
        assignments = persist_assignments()
        return {
            "message": "Assignments generated successfully",
            "count": len(assignments)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[AssignmentOut])
async def list_assignments(db: Session = Depends(get_db)):
    """List all assignments."""
    return db.query(Assignment).all()


@router.get("/reviewer/{reviewer_id}", response_model=List[AssignmentOut])
async def get_assignments_for_reviewer(reviewer_id: str, db: Session = Depends(get_db)):
    """Get all assignments for a specific reviewer (reviewer dashboard)."""
    return db.query(Assignment).filter(Assignment.reviewer_id == reviewer_id).all()


@router.get("/{assignment_id}", response_model=AssignmentOut)
async def get_assignment(assignment_id: str, db: Session = Depends(get_db)):
    """Get a single assignment by ID."""
    a = db.query(Assignment).filter(Assignment.assignment_id == assignment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return a


@router.delete("/{assignment_id}")
async def delete_assignment(assignment_id: str, db: Session = Depends(get_db)):
    """Delete an assignment."""
    a = db.query(Assignment).filter(Assignment.assignment_id == assignment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Decrement reviewer load
    reviewer = db.query(Reviewer).filter(Reviewer.reviewer_id == str(a.reviewer_id)).first()
    if reviewer and reviewer.current_load and reviewer.current_load > 0:
        reviewer.current_load -= 1

    db.delete(a)
    db.commit()
    return {"detail": "deleted"}

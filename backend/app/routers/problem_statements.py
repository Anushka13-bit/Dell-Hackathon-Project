import uuid
from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.problem_statement import ProblemStatement
from app.services.ai.pipelines.problem_statement.parser import parse_ps

router = APIRouter()

# --------------- Pydantic schemas ---------------

class ProblemStatementCreate(BaseModel):
    title: str
    raw_text: str
    min_size: Optional[int] = 2
    max_size: Optional[int] = 4

class ProblemStatementOut(BaseModel):
    ps_id: uuid.UUID
    title: Optional[str] = None
    raw_text: Optional[str] = None
    required_vector: Optional[dict] = None
    min_size: Optional[int] = None
    max_size: Optional[int] = None

    class Config:
        from_attributes = True

# --------------- CRUD endpoints ---------------

@router.post("/", response_model=ProblemStatementOut)
async def create_problem_statement(data: ProblemStatementCreate, db: Session = Depends(get_db)):
    """Create a new problem statement, parsing requirements via app.services.ai."""
    
    ps_id = str(uuid.uuid4())
    
    # Parse PS using app.services.ai
    try:
        parsed_req = parse_ps(
            raw_text=data.raw_text,
            title=data.title,
            ps_id=ps_id,
            team_size=data.max_size or 4
        )
        required_vector = parsed_req.required_vector.to_dict()
    except Exception as e:
        print(f"Failed to parse problem statement: {e}")
        required_vector = {}

    ps = ProblemStatement(
        ps_id=ps_id,
        title=data.title,
        raw_text=data.raw_text,
        required_vector=required_vector,
        min_size=data.min_size,
        max_size=data.max_size,
    )
    db.add(ps)
    db.commit()
    db.refresh(ps)
    return ps

@router.get("/", response_model=List[ProblemStatementOut])
async def list_problem_statements(db: Session = Depends(get_db)):
    """List all problem statements."""
    return db.query(ProblemStatement).all()

@router.get("/{ps_id}", response_model=ProblemStatementOut)
async def get_problem_statement(ps_id: str, db: Session = Depends(get_db)):
    """Get a problem statement by ID."""
    ps = db.query(ProblemStatement).filter(ProblemStatement.ps_id == ps_id).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Problem Statement not found")
    return ps

@router.delete("/{ps_id}")
async def delete_problem_statement(ps_id: str, db: Session = Depends(get_db)):
    """Delete a problem statement."""
    ps = db.query(ProblemStatement).filter(ProblemStatement.ps_id == ps_id).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Problem Statement not found")
    db.delete(ps)
    db.commit()

    return {"status": "success", "ps_id": str(ps.id)}

@router.post("/rubrics")
async def save_rubrics(data: dict):
    """Mock endpoint to save rubrics for MVP."""
    print("Saving rubrics:", data)
    return {"status": "success"}

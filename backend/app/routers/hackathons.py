import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.hackathon import Hackathon

from uuid import UUID
from datetime import date

router = APIRouter()


# --------------- Pydantic schemas ---------------

class HackathonCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class HackathonOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    class Config:
        from_attributes = True


# --------------- CRUD endpoints ---------------

@router.post("/", response_model=HackathonOut)
async def create_hackathon(data: HackathonCreate, db: Session = Depends(get_db)):
    """Create a new hackathon."""
    hackathon = Hackathon(
        id=uuid.uuid4(),
        title=data.title,
        description=data.description,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    db.add(hackathon)
    db.commit()
    db.refresh(hackathon)
    return hackathon


@router.get("/", response_model=List[HackathonOut])
async def list_hackathons(db: Session = Depends(get_db)):
    """List all hackathons."""
    return db.query(Hackathon).all()


@router.get("/{hackathon_id}", response_model=HackathonOut)
async def get_hackathon(hackathon_id: str, db: Session = Depends(get_db)):
    """Get a hackathon by ID."""
    h = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    return h


@router.put("/{hackathon_id}", response_model=HackathonOut)
async def update_hackathon(hackathon_id: str, data: HackathonCreate, db: Session = Depends(get_db)):
    """Update a hackathon."""
    h = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    h.title = data.title
    h.description = data.description
    h.start_date = data.start_date
    h.end_date = data.end_date
    db.commit()
    db.refresh(h)
    return h


@router.delete("/{hackathon_id}")
async def delete_hackathon(hackathon_id: str, db: Session = Depends(get_db)):
    """Delete a hackathon."""
    h = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    db.delete(h)
    db.commit()
    return {"detail": "deleted"}

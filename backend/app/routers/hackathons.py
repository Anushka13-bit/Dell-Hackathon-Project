import uuid
from datetime import date
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.hackathon import Hackathon

from uuid import UUID
from datetime import date

router = APIRouter()


class HackathonCreate(BaseModel):
    name: str
    theme: Optional[str] = None
    description: str | None = None
    registration_start: Optional[date] = None
    registration_end: Optional[date] = None

    event_start: Optional[date] = None
    event_end: Optional[date] = None

    min_team_size: int = 1
    max_team_size: int = 4


class HackathonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    theme: Optional[str] = None
    description: Optional[str] = None

    registration_start: Optional[date] = None
    registration_end: Optional[date] = None

    event_start: Optional[date] = None
    event_end: Optional[date] = None

    min_team_size: int
    max_team_size: int


@router.post("/", response_model=HackathonOut)
async def create_hackathon(
    data: HackathonCreate,
    db: Session = Depends(get_db)
):
    hackathon = Hackathon(
        id=uuid.uuid4(),
        name=data.name,
        theme=data.theme,
        description=data.description,
        registration_start=data.registration_start,
        registration_end=data.registration_end,
        event_start=data.event_start,
        event_end=data.event_end,
        min_team_size=data.min_team_size,
        max_team_size=data.max_team_size,
    )

    db.add(hackathon)
    db.commit()
    db.refresh(hackathon)

    return hackathon


@router.get("/", response_model=List[HackathonOut])
async def list_hackathons(db: Session = Depends(get_db)):
    return db.query(Hackathon).all()

@router.get("/{hackathon_id}", response_model=HackathonOut)
async def get_hackathon(hackathon_id: UUID, db: Session = Depends(get_db)):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    return hackathon
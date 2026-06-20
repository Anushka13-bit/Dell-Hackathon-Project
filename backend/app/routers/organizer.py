from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.participant import Participant
from ..models.reviewer import Reviewer
from ..models.team import Team
from ..models.registration import Registration
from ..models.idea_submission import IdeaSubmission
from ..models.assignment import Assignment

router = APIRouter()


@router.get("/summary")
async def organizer_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """High-level counts for the organizer dashboard."""
    return {
        "total_participants": db.query(Participant).count(),
        "total_reviewers": db.query(Reviewer).count(),
        "total_teams": db.query(Team).count(),
        "total_registrations": db.query(Registration).count(),
        "total_submissions": db.query(IdeaSubmission).count(),
        "total_assignments": db.query(Assignment).count(),
    }


@router.get("/participants")
async def all_participants(db: Session = Depends(get_db)):
    """Fetch all participants for the organizer dashboard."""
    return [
        {
            "id": p.id,
            "name": p.name,
            "college_name": p.college_name,
            "github_url": p.github_url,
            "declared_skills": p.declared_skills,
            "team_id": str(p.team_id) if p.team_id else None,
        }
        for p in db.query(Participant).all()
    ]


@router.get("/reviewers")
async def all_reviewers(db: Session = Depends(get_db)):
    """Fetch all reviewers for the organizer dashboard."""
    return [
        {
            "reviewer_id": str(r.reviewer_id),
            "name": r.name,
            "primary_specialization": r.primary_specialization,
            "current_load": r.current_load,
        }
        for r in db.query(Reviewer).all()
    ]


@router.get("/teams")
async def all_teams(db: Session = Depends(get_db)):
    """Fetch all teams for the organizer dashboard."""
    return [
        {
            "team_id": str(t.team_id),
            "name": t.name,
            "member_ids": t.member_ids,
        }
        for t in db.query(Team).all()
    ]


@router.get("/registrations")
async def all_registrations(db: Session = Depends(get_db)):
    """Fetch all registrations for the organizer dashboard."""
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "email": r.email,
            "college": r.college,
            "decision": r.decision,
            "score": r.score,
            "recommendation": r.recommendation,
        }
        for r in db.query(Registration).all()
    ]

from fastapi import HTTPException
from ..models.problem_statement import ProblemStatement
from ..models.hackathon import Hackathon
from participant_ai.pipelines.promo.generator import generate_promotional_content
from participant_ai.pipelines.reporting.pitch_generator import generate_success_report

@router.post("/generate-promo/{hackathon_id}")
async def generate_promo_content(hackathon_id: str, db: Session = Depends(get_db)):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    
    problem_statements = db.query(ProblemStatement).all()
    
    try:
        content = generate_promotional_content(hackathon, problem_statements)
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-success-report/{hackathon_id}")
async def generate_report(hackathon_id: str, db: Session = Depends(get_db)):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
        
    stats = {
        "total_participants": db.query(Participant).count(),
        "total_reviewers": db.query(Reviewer).count(),
        "total_teams": db.query(Team).count(),
        "total_registrations": db.query(Registration).count(),
        "total_submissions": db.query(IdeaSubmission).count(),
    }
    
    try:
        report = generate_success_report(hackathon, stats)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

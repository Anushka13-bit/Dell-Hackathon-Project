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
from app.services.ai.pipelines.promo.generator import generate_promotional_content
from app.services.ai.pipelines.reporting.pitch_generator import generate_success_report

@router.post("/generate-promo/{hackathon_id}")
async def generate_promo_content(hackathon_id: str, db: Session = Depends(get_db)):
    import uuid
    try:
        uid = uuid.UUID(hackathon_id)
        hackathon = db.query(Hackathon).filter(Hackathon.id == uid).first()
    except ValueError:
        hackathon = None
        
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    
    problem_statements = db.query(ProblemStatement).all()
    
    try:
        content = await generate_promotional_content(hackathon, problem_statements)
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-success-report/{hackathon_id}")
async def generate_report(hackathon_id: str, db: Session = Depends(get_db)):
    import uuid
    try:
        uid = uuid.UUID(hackathon_id)
        hackathon = db.query(Hackathon).filter(Hackathon.id == uid).first()
    except ValueError:
        hackathon = None

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
        report = await generate_success_report(hackathon, stats)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import rapidfuzz
import uuid
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

class SubmitRegistrationPayload(BaseModel):
    user_id: str
    name: str
    email: str
    college: str
    degree: str
    github: str
    gender: str
    phone: str
    skills: Optional[List[str]] = []

@router.post("/registrations/submit")
async def submit_registration(payload: SubmitRegistrationPayload, db: Session = Depends(get_db)):
    # 1. Fetch existing registrations
    existing = db.query(Registration).all()
    
    exact_email = False
    exact_github = False
    max_fuzzy_score = 0.0
    matched_profile = None

    for r in existing:
        if r.email and r.email.lower() == payload.email.lower():
            exact_email = True
            matched_profile = str(r.id)
        if r.github and r.github.lower() == payload.github.lower():
            exact_github = True
            matched_profile = str(r.id)

        name_sim = rapidfuzz.fuzz.token_sort_ratio(payload.name.lower(), (r.name or "").lower()) / 100.0
        college_sim = rapidfuzz.fuzz.token_sort_ratio(payload.college.lower(), (r.college or "").lower()) / 100.0

        combined_score = (name_sim * 0.6) + (college_sim * 0.4)
        if combined_score > max_fuzzy_score:
            max_fuzzy_score = combined_score
            if not exact_email and not exact_github:
                matched_profile = str(r.id)

    # 2. Determine Decision
    if exact_email or exact_github:
        final_score = 1.0
        decision = 'HARD_DUPLICATE'
    else:
        final_score = max_fuzzy_score
        if final_score < 0.70:
            decision = 'AUTO_APPROVED'
        elif 0.70 <= final_score < 0.85:
            decision = 'MANUAL_REVIEW'
        else:
            decision = 'POTENTIAL_DUPLICATE'

    reg_id = uuid.uuid4()
    
    # Check if they already have one
    existing_reg = db.query(Registration).filter(Registration.user_id == uuid.UUID(payload.user_id)).first()
    
    if existing_reg:
        reg_id = existing_reg.id
        existing_reg.decision = decision
        existing_reg.score = final_score
        existing_reg.skills = payload.skills
        db.commit()
    else:
        reg = Registration(
            id=reg_id,
            user_id=uuid.UUID(payload.user_id),
            name=payload.name,
            email=payload.email,
            college=payload.college,
            github=payload.github,
            degree=payload.degree,
            phone=payload.phone,
            gender=payload.gender,
            skills=payload.skills,
            decision=decision,
            score=final_score,
            exact_email=exact_email,
            exact_github=exact_github,
            matched_profile=matched_profile,
            sim_name=max_fuzzy_score,
            sim_college=max_fuzzy_score,
            recommendation=f"Server generated decision: {decision}",
            submitted_at=datetime.now(timezone.utc)
        )
        db.add(reg)
        db.commit()

    if decision == 'AUTO_APPROVED':
        p = db.query(Participant).filter(Participant.user_id == payload.user_id).first()
        if p:
            p.name = payload.name
            p.college_name = payload.college
            p.github_url = payload.github
            p.degree = payload.degree
            p.phone = payload.phone
            p.gender = payload.gender
            p.email = payload.email
            p.declared_skills = payload.skills
            p.status = 'approved'
            db.commit()
        else:
            p = Participant(
                id=str(uuid.uuid4()),
                user_id=payload.user_id,
                name=payload.name,
                college_name=payload.college,
                github_url=payload.github,
                degree=payload.degree,
                phone=payload.phone,
                gender=payload.gender,
                email=payload.email,
                declared_skills=payload.skills,
                status='approved',
            )
            db.add(p)
            db.commit()

    return {
        "status": "success",
        "registration_id": str(reg_id),
        "decision": decision,
        "score": final_score
    }

@router.post("/registrations/{registration_id}/approve")
async def approve_registration(registration_id: str, db: Session = Depends(get_db)):
    try:
        from app.services.audit_service import log_event
    except ImportError:
        def log_event(*args, **kwargs): pass

    reg = db.query(Registration).filter(Registration.id == uuid.UUID(registration_id)).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    if reg.decision == 'AUTO_APPROVED':
        return {"status": "already_approved"}

    reg.decision = 'AUTO_APPROVED'
    db.commit()

    p = db.query(Participant).filter(Participant.user_id == str(reg.user_id)).first()
    if not p:
        p = Participant(
            id=str(uuid.uuid4()),
            user_id=str(reg.user_id),
            name=reg.name,
            college_name=reg.college,
            github_url=reg.github,
            declared_skills=reg.skills,
        )
        db.add(p)
        db.commit()

    try:
        log_event(
            db=db,
            event_type="registration_approved",
            payload={"target": str(reg.id), "previous_decision": "MANUAL_REVIEW"},
            user_id="organizer"
        )
    except Exception as e:
        print(f"Failed to log event: {e}")

    return {"status": "approved", "participant_created": True}

@router.post("/registrations/{registration_id}/reject")
async def reject_registration(registration_id: str, db: Session = Depends(get_db)):
    try:
        from app.services.audit_service import log_event
    except ImportError:
        def log_event(*args, **kwargs): pass

    reg = db.query(Registration).filter(Registration.id == uuid.UUID(registration_id)).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    if reg.decision == 'REJECTED':
        return {"status": "already_rejected"}

    reg.decision = 'REJECTED'
    db.commit()

    try:
        log_event(
            db=db,
            event_type="registration_rejected",
            payload={"target": str(reg.id), "reason": "Manual rejection"},
            user_id="organizer"
        )
    except Exception as e:
        print(f"Failed to log event: {e}")

    return {"status": "rejected"}


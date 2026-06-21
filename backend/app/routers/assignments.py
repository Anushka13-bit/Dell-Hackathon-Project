import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.assignment import Assignment
from ..models.reviewer import Reviewer

from uuid import UUID
from datetime import datetime
from typing import Any

from ..models.idea_submission import IdeaSubmission
from ..models.team import Team
from ..models.participant import Participant
from ..models.problem_statement import ProblemStatement
from ..models.evaluation import Evaluation

from app.tasks.reviewer_tasks import (
    reviewer_assignment_task
)

router = APIRouter()


# --------------- Pydantic schemas ---------------

class AssignmentCreate(BaseModel):
    idea_id: str
    reviewer_id: str
    compatibility_score: Optional[float] = None
    explanation: Optional[dict] = None

class AssignmentOut(BaseModel):
    assignment_id: UUID
    idea_id: Optional[UUID] = None
    reviewer_id: Optional[UUID] = None

    compatibility_score: Optional[float] = None

    explanation: Optional[Any] = None

    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReviewerDashboardTeam(BaseModel):
    assignment_id: str
    idea_id: str
    team_name: str
    members: list[str]
    status: str
    idea_title: str

class ReviewerDetailResponse(BaseModel):
    team_name: str
    members: list[str]

    problem_statement_title: str | None = None
    problem_statement_text: str | None = None

    idea_title: str | None = None
    idea_description: str | None = None

    github_url: str | None = None
    ppt_url: str | None = None
    video_url: str | None = None

    ai_feedback: str | None = None

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
    """
    Queue reviewer assignment generation in the background.
    """

    task = reviewer_assignment_task.delay()

    return {
        "status": "queued",
        "message": "Reviewer assignment pipeline started",
        "task_id": task.id
    }


@router.get("/", response_model=List[AssignmentOut])
async def list_assignments(db: Session = Depends(get_db)):
    """List all assignments."""
    return db.query(Assignment).all()


@router.get("/reviewer/{reviewer_id}", response_model=List[AssignmentOut])
async def get_assignments_for_reviewer(reviewer_id: str, db: Session = Depends(get_db)):
    """Get all assignments for a specific reviewer (reviewer dashboard)."""
    return db.query(Assignment).filter(Assignment.reviewer_id == reviewer_id).all()

@router.get(
    "/reviewer-dashboard/{reviewer_id}",
    response_model=List[ReviewerDashboardTeam]
)
async def reviewer_dashboard(
    reviewer_id: str,
    db: Session = Depends(get_db)
):
    import time

    start = time.time()

    # -------------------------
    # Fetch assignments
    # -------------------------
    assignments = (
        db.query(Assignment)
        .filter(Assignment.reviewer_id == reviewer_id)
        .all()
    )

    if not assignments:
        return []

    # -------------------------
    # Fetch all submissions
    # -------------------------
    idea_ids = [a.idea_id for a in assignments]

    submissions = (
        db.query(IdeaSubmission)
        .filter(IdeaSubmission.idea_id.in_(idea_ids))
        .all()
    )

    submission_map = {
        str(s.idea_id): s
        for s in submissions
    }

    # -------------------------
    # Fetch all teams
    # -------------------------
    team_ids = [
        s.team_id
        for s in submissions
        if s.team_id
    ]

    teams = (
        db.query(Team)
        .filter(Team.team_id.in_(team_ids))
        .all()
    )

    team_map = {
        str(t.team_id): t
        for t in teams
    }

    # -------------------------
    # Fetch all participants
    # -------------------------
    all_member_ids = []

    for team in teams:
        if team.member_ids:
            all_member_ids.extend(team.member_ids)

    participants = (
        db.query(Participant)
        .filter(Participant.id.in_(all_member_ids))
        .all()
    )

    participant_map = {
        str(p.id): p
        for p in participants
    }

    # -------------------------
    # Build dashboard
    # -------------------------
    dashboard = []

    for assignment in assignments:

        submission = submission_map.get(
            str(assignment.idea_id)
        )

        if not submission:
            continue

        team = team_map.get(
            str(submission.team_id)
        )

        if not team:
            continue

        member_names = []

        for member_id in (team.member_ids or []):

            participant = participant_map.get(
                str(member_id)
            )

            if participant:
                member_names.append(
                    participant.name or "Un-named Participant"
                )

        evaluation = (
            db.query(Evaluation)
            .filter(
                Evaluation.idea_id == assignment.idea_id,
                Evaluation.reviewer_id == assignment.reviewer_id,
            )
            .first()
        )

        status = "Reviewed" if evaluation else "Pending"
    
        dashboard.append(
            ReviewerDashboardTeam(
                assignment_id=str(assignment.assignment_id),
                idea_id=str(assignment.idea_id),
                team_name=team.name or "Unnamed Team",
                members=member_names,
                status=status,
                idea_title=submission.title or "Untitled Idea",
            )
        )

    print(
        f"REVIEWER DASHBOARD TIME: {round(time.time() - start, 3)}s"
    )

    return dashboard

@router.get(
    "/reviewer-detail/{idea_id}",
    response_model=ReviewerDetailResponse
)
async def reviewer_detail(
    idea_id: str,
    db: Session = Depends(get_db)
):

    submission = (
        db.query(IdeaSubmission)
        .filter(IdeaSubmission.idea_id == idea_id)
        .first()
    )

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Idea submission not found"
        )

    team = (
        db.query(Team)
        .filter(Team.team_id == submission.team_id)
        .first()
    )

    problem_statement = (
        db.query(ProblemStatement)
        .filter(ProblemStatement.ps_id == submission.ps_id)
        .first()
    )

    member_names = []

    if team:
        for member_id in (team.member_ids or []):

            participant = (
                db.query(Participant)
                .filter(Participant.id == member_id)
                .first()
            )

            if participant and participant.name:
                member_names.append(participant.name)

    return ReviewerDetailResponse(
        team_name=team.name if team else "Unnamed Team",
        members=member_names,

        problem_statement_title=(
            problem_statement.title
            if problem_statement else None
        ),

        problem_statement_text=(
            problem_statement.raw_text
            if problem_statement else None
        ),

        idea_title=submission.title,
        idea_description=submission.description,

        github_url=submission.github_url,
        ppt_url=submission.ppt_url,
        video_url=submission.video_url,

        ai_feedback=submission.ai_feedback,
    )

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

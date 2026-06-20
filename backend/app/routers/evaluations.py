import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import execute, fetch_all
from ..deps import get_db
from ..models.evaluation import Evaluation
from ..worker import detect_bias_task

router = APIRouter()

class EvaluationSubmitRequest(BaseModel):
    hackathon_id: str
    assignment_id: str
    reviewer_id: str
    idea_id: str
    score: float
    feedback: Optional[str] = None

class BiasReportResponse(BaseModel):
    alerts: List[dict]

@router.post("/submit")
async def submit_evaluation(request: EvaluationSubmitRequest):
    """
    Submits a new evaluation score and triggers the background bias detection task.
    """
    eval_id = str(uuid.uuid4())
    
    query = """
    INSERT INTO evaluations (evaluation_id, assignment_id, reviewer_id, idea_id, score, feedback, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, NOW())
    """
    try:
        execute(query, (
            eval_id,
            request.assignment_id,
            request.reviewer_id,
            request.idea_id,
            request.score,
            request.feedback
        ))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit evaluation: {str(e)}")

    # Trigger background bias detection
    detect_bias_task.delay(request.hackathon_id)

    return {"status": "success", "evaluation_id": eval_id}


@router.get("/bias-report", response_model=BiasReportResponse)
async def get_bias_report():
    """
    Fetches the latest BIAS_ALERT logs from the audit_logs table.
    """
    query = """
    SELECT payload, created_at
    FROM audit_logs
    WHERE event_type = 'BIAS_ALERT'
    ORDER BY created_at DESC
    LIMIT 50
    """
    try:
        results = fetch_all(query)
        alerts = []
        for r in results:
            alert = r['payload']
            alert['created_at'] = r['created_at']
            alerts.append(alert)
        return {"alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bias report: {str(e)}")

# --------------- Pydantic schemas ---------------

class EvaluationCreate(BaseModel):
    assignment_id: Optional[str] = None
    reviewer_id: str
    idea_id: str
    score: float
    feedback: Optional[str] = None


class EvaluationOut(BaseModel):
    evaluation_id: str
    assignment_id: Optional[str] = None
    reviewer_id: Optional[str] = None
    idea_id: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# --------------- CRUD endpoints ---------------

@router.post("/evaluate", response_model=EvaluationOut)
async def create_evaluation(data: EvaluationCreate, db: Session = Depends(get_db)):
    """Store evaluation scores and feedback."""
    evaluation = Evaluation(
        evaluation_id=uuid.uuid4(),
        assignment_id=data.assignment_id,
        reviewer_id=data.reviewer_id,
        idea_id=data.idea_id,
        score=data.score,
        feedback=data.feedback,
        created_at=datetime.now(timezone.utc),
    )
    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)
    return evaluation


@router.get("/", response_model=List[EvaluationOut])
async def list_evaluations(db: Session = Depends(get_db)):
    """List all evaluations."""
    return db.query(Evaluation).all()


@router.get("/idea/{idea_id}", response_model=List[EvaluationOut])
async def get_evaluations_by_idea(idea_id: str, db: Session = Depends(get_db)):
    """Get all evaluations for a specific idea submission."""
    return db.query(Evaluation).filter(Evaluation.idea_id == idea_id).all()


@router.get("/reviewer/{reviewer_id}", response_model=List[EvaluationOut])
async def get_evaluations_by_reviewer(reviewer_id: str, db: Session = Depends(get_db)):
    """Get all evaluations by a specific reviewer."""
    return db.query(Evaluation).filter(Evaluation.reviewer_id == reviewer_id).all()


@router.get("/{evaluation_id}", response_model=EvaluationOut)
async def get_evaluation(evaluation_id: str, db: Session = Depends(get_db)):
    """Get a single evaluation."""
    e = db.query(Evaluation).filter(Evaluation.evaluation_id == evaluation_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return e


from ..models.team import Team
from ..models.idea_submission import IdeaSubmission
from participant_ai.pipelines.feedback.nlg import generate_team_feedback
from sqlalchemy import func

@router.post("/compute-results/{hackathon_id}")
async def compute_results(hackathon_id: str, db: Session = Depends(get_db)):
    """Computes final results and triggers NLG feedback generation for all teams."""
    
    # Get all evaluations
    evals = db.query(Evaluation).all()
    if not evals:
        return {"message": "No evaluations found to compute results."}
        
    global_avg = sum(e.score for e in evals if e.score) / len(evals)
    
    # Group by idea
    ideas = db.query(IdeaSubmission).all()
    count = 0
    
    for idea in ideas:
        idea_evals = [e for e in evals if str(e.idea_id) == str(idea.idea_id)]
        if not idea_evals:
            continue
            
        team = db.query(Team).filter(Team.team_id == idea.team_id).first()
        team_name = team.name if team else "Unknown Team"
        
        eval_data = [{"score": e.score, "feedback": e.feedback} for e in idea_evals if e.score is not None]
        
        try:
            feedback_json = generate_team_feedback(
                team_name=team_name,
                project_title=idea.title or "Untitled",
                project_description=idea.description or "No description",
                evaluations=eval_data,
                global_average_score=global_avg
            )
            idea.ai_feedback = feedback_json.get("feedback_text", "Could not generate feedback.")
            count += 1
        except Exception as e:
            print(f"Failed to generate feedback for {idea.idea_id}: {e}")
            
    db.commit()
    return {"message": f"Successfully computed results and generated feedback for {count} teams."}


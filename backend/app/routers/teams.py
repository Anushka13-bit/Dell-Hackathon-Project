from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any

from participant_ai.pipelines.team_formation.formation import form_teams
from participant_ai.core.schemas import Participant, PSRequirement

router = APIRouter()

class TeamFormationRequest(BaseModel):
    unassigned_participants: List[Participant]
    problem_statements: List[PSRequirement]

@router.post("/form")
async def trigger_team_formation(request: TeamFormationRequest, background_tasks: BackgroundTasks):
    """
    Triggers coverage-driven team assembly as a background task.
    In a real app, this would use Celery to write results to Supabase asynchronously.
    For now, it runs native FastAPI background tasks.
    """
    
    def run_formation(participants, requirements):
        # This will block the background thread, which is fine for hackathon dev.
        # It calculates the math and theoretically would update Supabase here.
        result = form_teams(participants, requirements)
        print(f"Formation Complete. {len(result['teams'])} teams formed.")
    
    background_tasks.add_task(run_formation, request.unassigned_participants, request.problem_statements)
    
    return {"status": "formation_started", "message": "Teams are being formed in the background."}

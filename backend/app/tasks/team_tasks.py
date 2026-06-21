import uuid
from app.core.celery_app import celery_app
from app.deps import SessionLocal
from app.models.participant import Participant
from app.models.problem_statement import ProblemStatement
from app.models.team import Team

@celery_app.task(name="team_formation_task")
def team_formation_task(team_size: int = 4):
    """
    Background task to form generic diverse teams of a fixed size.
    """
    from app.services.ai.pipelines.team_formation.formation import form_teams
    from app.services.ai.core.schemas import Participant as ParticipantSchema, SkillVector

    db = SessionLocal()
    try:
        # 1. Fetch unassigned participants
        db_participants = db.query(Participant).filter(Participant.team_id == None).all()
        if not db_participants:
            return {"status": "success", "message": "No unassigned participants found."}

        schema_participants = []
        from app.services.ai.core.schemas import ParsedResume
        for p in db_participants:
            # Safely parse skill vector, ignoring non-numeric values like 'processing'
            raw_sv = p.skill_vector or {}
            clean_sv = {}
            if isinstance(raw_sv, dict):
                for k, v in raw_sv.items():
                    try:
                        clean_sv[k] = float(v)
                    except (ValueError, TypeError):
                        pass

            schema_participants.append(
                ParticipantSchema(
                    id=str(p.id),
                    parsed_resume=ParsedResume(
                        name=p.name or "Unknown",
                        college_name=p.college_name or "Unknown",
                        github_url=p.github_url or "",
                        raw_skills=p.declared_skills or []
                    ),
                    skill_vector=SkillVector.from_dict(clean_sv)
                )
            )

        # 2. Form teams using the fixed size
        result = form_teams(schema_participants, team_size=team_size)
        
        formed_teams = result.get("teams", [])

        # 4. Save teams to DB
        for t in formed_teams:
            team_id = uuid.uuid4()
            
            # t is a Team schema object which has member_ids
            member_ids = list(t.member_ids)
            
            new_team = Team(
                team_id=team_id,
                name=f"{t.name}",
                member_ids=member_ids,
                coverage_score=getattr(t, "coverage_score", 0.0),
                diversity_score=getattr(t, "diversity_score", 0.0),
                formation_confidence=getattr(t, "formation_confidence", 0.0)
            )
            db.add(new_team)
            db.flush() # Ensure team is inserted before updating participants
            
            # Update participants
            for p_id in member_ids:
                db_p = db.query(Participant).filter(Participant.id == str(p_id)).first()
                if db_p:
                    db_p.team_id = team_id
                    
        db.commit()
        return {"status": "success", "teams_formed": len(formed_teams)}
        
    except Exception as e:
        db.rollback()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()

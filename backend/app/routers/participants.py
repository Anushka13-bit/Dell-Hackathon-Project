import io
import uuid
from typing import Dict, Any, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.participant import Participant

router = APIRouter()


# --------------- Pydantic schemas ---------------

class ParticipantCreate(BaseModel):
    id: str
    name: Optional[str] = None
    college_name: Optional[str] = None
    github_url: Optional[str] = None
    declared_skills: Optional[List[str]] = []
    skill_vector: Optional[dict] = None
    team_id: Optional[str] = None

class ParticipantOut(BaseModel):
    id: str
    name: Optional[str] = None
    college_name: Optional[str] = None
    github_url: Optional[str] = None
    declared_skills: Optional[List[str]] = []
    skill_vector: Optional[dict] = None
    team_id: Optional[str] = None

    class Config:
        from_attributes = True


class ResumeAnalysisRequest(BaseModel):
    resume_text: str


class ResumeAnalysisResponse(BaseModel):
    parsed_resume: dict
    skill_vector: dict
    semantic_embedding: List[float]
    breakdown: dict


# --------------- CRUD endpoints ---------------

@router.post("/register", response_model=ParticipantOut)
async def register_participant(
    id: str = Form(...),
    name: Optional[str] = Form(None),
    college_name: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Store a new participant registration. Resume skill parsing runs in background via Celery."""
    existing = db.query(Participant).filter(Participant.id == id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Participant already registered")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for resumes")

    try:
        import pypdf
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail="The provided file is not a valid PDF or is corrupted. Please upload a valid PDF resume.")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the PDF")

    # Save participant immediately with pending status
    participant = Participant(
        id=id,
        name=name,
        college_name=college_name,
        github_url=github_url,
        team_id=None,
        vectorization_status="pending",
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)

    # Dispatch heavy LLM resume parsing to Celery background worker
    from app.tasks.resume_tasks import parse_participant_resume
    parse_participant_resume.delay(id, text)

    return participant



@router.get("/", response_model=List[ParticipantOut])
async def list_participants(db: Session = Depends(get_db)):
    """List all participants."""
    return db.query(Participant).all()


@router.get("/{participant_id}", response_model=ParticipantOut)
async def get_participant(participant_id: str, db: Session = Depends(get_db)):
    """Get a single participant by ID."""
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    return p


@router.put("/{participant_id}", response_model=ParticipantOut)
async def update_participant(participant_id: str, data: ParticipantCreate, db: Session = Depends(get_db)):
    """Update an existing participant."""
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")

    p.name = data.name
    p.college_name = data.college_name
    p.github_url = data.github_url
    p.declared_skills = data.declared_skills or []
    p.skill_vector = data.skill_vector
    p.team_id = data.team_id
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{participant_id}")
async def delete_participant(participant_id: str, db: Session = Depends(get_db)):
    """Delete a participant."""
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    db.delete(p)
    db.commit()
    return {"detail": "deleted"}


# --------------- AI analysis endpoints ---------------

@router.post("/analyze_resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest):
    """Parses resume text and returns skill analysis."""
    from app.services.ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

    results = await parse_and_vectorize_batch([request.resume_text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]

    return ResumeAnalysisResponse(
        parsed_resume=parsed.dict(),
        skill_vector=vector.to_dict(),
        semantic_embedding=embedding,
        breakdown=breakdown,
    )

@router.post("/upload_resume", response_model=ResumeAnalysisResponse)
async def upload_resume(file: UploadFile = File(...)):
    """Parses an uploaded PDF resume and returns the AI analysis inline."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        import pypdf
        import io
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail="Corrupted PDF")
        
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text extracted")

    from app.services.ai.pipelines.resume_rag.parser import parse_and_vectorize_batch
    results = await parse_and_vectorize_batch([text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]

    return ResumeAnalysisResponse(
        parsed_resume=parsed.dict(),
        skill_vector=vector.to_dict(),
        semantic_embedding=embedding,
        breakdown=breakdown,
        raw_text=text
    )

class BackgroundResumePayload(BaseModel):
    user_id: str
    raw_text: str

@router.post("/process_resume_background")
async def process_resume_background(payload: BackgroundResumePayload):
    """
    Triggers the Celery worker to parse the resume using the LLM
    and update the participant's skill vector and embeddings in the background.
    """
    from app.worker import process_resume_task
    
    # Send the task to Celery
    task = process_resume_task.delay(payload.user_id, payload.raw_text)
    
    return {"status": "queued", "task_id": task.id}

from pydantic import BaseModel

class FaceScanRequest(BaseModel):
    registration_id: str
    status: str
    score: float
    consented: bool

@router.post("/validate-facescan")
async def validate_facescan(request: FaceScanRequest, db: Session = Depends(get_db)):
    """Mocks the FaceScan validation processing for the hackathon MVP."""
    from ..models.registration import Registration
    from datetime import datetime, timezone
    
    reg = db.query(Registration).filter(Registration.id == request.registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    reg.face_scan_status = request.status
    reg.face_scan_score = request.score
    reg.face_scan_consented = request.consented
    
    # Store deletion timestamp if consent is revoked
    if not request.consented:
        reg.face_scan_deleted_at = datetime.now(timezone.utc)
        
    db.commit()
    return {"message": "FaceScan validation processed securely.", "status": request.status}


class ChatRequest(BaseModel):
    hackathon_id: str
    question: str

@router.post("/chat")
async def chat_with_bot(request: ChatRequest, db: Session = Depends(get_db)):
    """Ask the RAG Chatbot a question about the hackathon."""
    from app.services.ai.pipelines.chatbot.rag import ask_chatbot
    
    try:
        response = ask_chatbot(request.question, request.hackathon_id, db)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{participant_id}/data")
async def delete_participant_data(participant_id: str, db: Session = Depends(get_db)):
    """GDPR Right-to-Erasure: Nullifies PII and anonymizes registration."""
    from datetime import datetime, timezone
    
    # Anonymize participant record
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    p.name = "Anonymized User"
    p.github_url = None
    p.linkedin_url = None
    # We keep college_name and skill_vector for statistical purposes
    
    db.commit()
    return {"message": "Participant PII successfully anonymized."}


@router.delete("/{participant_id}/facescan")
async def delete_facescan_data(participant_id: str, db: Session = Depends(get_db)):
    """Deletes FaceScan validation metadata."""
    from ..models.registration import Registration
    from datetime import datetime, timezone
    
    # We assume registration ID matches participant ID or we look it up.
    # Actually, let's just find the registration linked to this participant
    # Wait, Participant table doesn't have registration_id directly in the SQLAlchemy model?
    # Let's search Registration by user_id = participant_id
    reg = db.query(Registration).filter(Registration.id == participant_id).first()
    if not reg:
        # Check if participant_id is the user_id
        reg = db.query(Registration).filter(Registration.user_id == participant_id).first()
        
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    reg.face_scan_status = None
    reg.face_scan_score = None
    reg.face_scan_consented = False
    reg.face_scan_deleted_at = datetime.now(timezone.utc)
    
    db.commit()
    return {"message": "FaceScan metadata successfully deleted."}

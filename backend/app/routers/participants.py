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
    year_of_study: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    declared_skills: Optional[List[str]] = []
    skill_vector: Optional[dict] = None
    team_id: Optional[str] = None

class ParticipantOut(BaseModel):
    id: str
    name: Optional[str] = None
    college_name: Optional[str] = None
    year_of_study: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
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
    """Store a new participant registration, extracting skills from their uploaded resume."""
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

    from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

    # Extract skills using participant_ai
    results = await parse_and_vectorize_batch([text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]

    participant = Participant(
        id=id,
        name=name or parsed.name,
        college_name=college_name or parsed.college_name,
        year_of_study=parsed.year_of_study,
        github_url=github_url or parsed.github_url,
        linkedin_url=parsed.linkedin_url,
        declared_skills=parsed.raw_skills if hasattr(parsed, 'raw_skills') else [],
        skill_vector=vector.to_dict(),
        team_id=None,
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
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
    from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

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
    """Accepts a PDF file, extracts text, and runs AI analysis."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        import pypdf

        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the PDF")

    from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

    results = await parse_and_vectorize_batch([text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]

    return ResumeAnalysisResponse(
        parsed_resume=parsed.dict(),
        skill_vector=vector.to_dict(),
        semantic_embedding=embedding,
        breakdown=breakdown,
    )
    exact_email = False
    exact_github = False
    max_fuzzy_score = 0.0
    matched_profile = None

    for r in existing:
        if r['email'].lower() == payload.email.lower():
            exact_email = True
            matched_profile = r['id']
        if r['github'].lower() == payload.github.lower():
            exact_github = True
            matched_profile = r['id']

        # Fuzzy string matching using RapidFuzz
        name_sim = rapidfuzz.fuzz.token_sort_ratio(payload.name.lower(), r['name'].lower()) / 100.0
        college_sim = rapidfuzz.fuzz.token_sort_ratio(payload.college.lower(), r['college'].lower()) / 100.0

        # PRD specifies: Name (0.60) + College (0.40)
        combined_score = (name_sim * 0.6) + (college_sim * 0.4)
        if combined_score > max_fuzzy_score:
            max_fuzzy_score = combined_score
            if not exact_email and not exact_github:
                matched_profile = r['id']

    # 2. Determine Decision Thresholds
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

    # 3. Save Registration
    reg_id = execute(
        """
        INSERT INTO registrations (
            hackathon_id, user_id, name, email, college, github, skills,
            decision, score, exact_email, exact_github, matched_profile
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            payload.hackathon_id, payload.user_id, payload.name, payload.email, 
            payload.college, payload.github, payload.skills,
            decision, final_score, exact_email, exact_github, matched_profile
        )
    )

    # 4. If Auto-Approved, create the actual participant profile
    if decision == 'AUTO_APPROVED':
        execute(
            """
            INSERT INTO participants (hackathon_id, user_id, registration_id, name, email, college_name, github_url, declared_skills, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'approved')
            """,
            (payload.hackathon_id, payload.user_id, reg_id['id'], payload.name, payload.email, payload.college, payload.github, payload.skills)
        )

    return {
        "status": "success",
        "registration_id": reg_id['id'],
        "decision": decision,
        "score": final_score
    }

class BackgroundResumePayload(BaseModel):
    user_id: str
    raw_text: str

@router.post("/process_resume_background")
async def process_resume_background(payload: BackgroundResumePayload):
    """
    Triggers the Celery worker to parse the resume using the LLM
    and update the participant's skill vector and embeddings in the background.
    """
    from backend.app.worker import process_resume_task
    
    # Send the task to Celery
    task = process_resume_task.delay(payload.user_id, payload.raw_text)
    
    return {"status": "queued", "task_id": task.id}

@router.post("/{registration_id}/approve")
async def approve_registration(registration_id: str):
    """
    Admin endpoint to manually approve a registration that was flagged for review.
    """
    reg = fetch_one("SELECT * FROM registrations WHERE id = %s", (registration_id,))
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    if reg['decision'] == 'AUTO_APPROVED':
        return {"status": "already_approved"}

    execute("UPDATE registrations SET decision = 'AUTO_APPROVED' WHERE id = %s", (registration_id,))

    # Explicitly create participant
    execute(
        """
        INSERT INTO participants (hackathon_id, user_id, registration_id, name, email, college_name, github_url, declared_skills, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'approved')
        """,
        (reg['hackathon_id'], reg['user_id'], reg['id'], reg['name'], reg['email'], reg['college'], reg['github'], reg['skills'])
    )

    return {"status": "approved", "participant_created": True}

@router.post("/{registration_id}/reject")
async def reject_registration(registration_id: str):
    """
    Admin endpoint to manually reject a registration.
    """
    reg = fetch_one("SELECT * FROM registrations WHERE id = %s", (registration_id,))
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    if reg['decision'] == 'REJECTED':
        return {"status": "already_rejected"}

    execute("UPDATE registrations SET decision = 'REJECTED' WHERE id = %s", (registration_id,))

    # Ideally also handle deleting from participants if it was somehow approved then rejected, but keeping it simple for demo.

    return {"status": "rejected"}

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
    from participant_ai.pipelines.chatbot.rag import ask_chatbot
    
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

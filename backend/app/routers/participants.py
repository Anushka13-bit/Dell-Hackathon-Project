import io
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

router = APIRouter()

class ResumeAnalysisRequest(BaseModel):
    resume_text: str

class ResumeAnalysisResponse(BaseModel):
    parsed_resume: dict
    skill_vector: dict
    semantic_embedding: List[float]
    breakdown: dict

@router.post("/analyze_resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest):
    """
    Parses resume text directly.
    """
    results = await parse_and_vectorize_batch([request.resume_text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]
    
    return ResumeAnalysisResponse(
        parsed_resume=parsed.dict(),
        skill_vector=vector.to_dict(),
        semantic_embedding=embedding,
        breakdown=breakdown
    )

@router.post("/upload_resume", response_model=ResumeAnalysisResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts a PDF file, extracts text via pypdf, and runs the AI analysis.
    """
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
        
    results = await parse_and_vectorize_batch([text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]
    
    return ResumeAnalysisResponse(
        parsed_resume=parsed.dict(),
        skill_vector=vector.to_dict(),
        semantic_embedding=embedding,
        breakdown=breakdown
    )

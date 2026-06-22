import json
from typing import Dict, List
from sqlalchemy.orm import Session
from app.models.knowledge_base import KnowledgeDocument
from app.services.ai.core.llm import call_json_async

async def ask_chatbot(question: str, hackathon_id: str, db: Session) -> Dict[str, str]:
    """Retrieves context and generates an answer using the RAG pipeline."""
    
    # Simple semantic search (mocked via direct fetch for demo if embeddings not populated)
    # Ideally, we'd embed the question and do:
    # docs = db.query(KnowledgeDocument).order_by(KnowledgeDocument.embedding.l2_distance(question_emb)).limit(3).all()
    
    from app.models.hackathon import Hackathon

    # Fetch hackathon details
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    hackathon_context = ""
    if hackathon:
        hackathon_context = f"""
HACKATHON DETAILS:
Name: {hackathon.name}
Theme: {hackathon.theme}
Description: {hackathon.description}
Registration Window: {hackathon.registration_start} to {hackathon.registration_end}
Event Dates: {hackathon.event_start} to {hackathon.event_end}
Team Size: {hackathon.min_team_size} to {hackathon.max_team_size} members
"""

    docs = db.query(KnowledgeDocument).filter(KnowledgeDocument.hackathon_id == hackathon_id).limit(5).all()
    kb_context = "\n".join([d.content for d in docs]) if docs else ""
    
    context = f"{hackathon_context}\n\nADDITIONAL KNOWLEDGE BASE INFO:\n{kb_context}".strip()
    if not context:
        context = "No specific context available."

    prompt = f"""
You are an AI Assistant for a Hackathon. Answer the user's question based ONLY on the provided context.

Context:
{context}

Question: {question}

Return a strictly valid JSON object with the following keys:
- "answer": A direct, helpful response to the question.
- "confidence": A score from 0.0 to 1.0 indicating how confident you are in the answer based on the context.
"""

    return await call_json_async(prompt)

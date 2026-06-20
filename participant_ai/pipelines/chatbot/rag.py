import json
from typing import Dict, List
from sqlalchemy.orm import Session
from backend.app.models.knowledge_base import KnowledgeDocument
from participant_ai.core.llm import call_json

def ask_chatbot(question: str, hackathon_id: str, db: Session) -> Dict[str, str]:
    """Retrieves context and generates an answer using the RAG pipeline."""
    
    # Simple semantic search (mocked via direct fetch for demo if embeddings not populated)
    # Ideally, we'd embed the question and do:
    # docs = db.query(KnowledgeDocument).order_by(KnowledgeDocument.embedding.l2_distance(question_emb)).limit(3).all()
    
    docs = db.query(KnowledgeDocument).filter(KnowledgeDocument.hackathon_id == hackathon_id).limit(5).all()
    context = "\n".join([d.content for d in docs]) if docs else "No specific context available."

    prompt = f"""
You are an AI Assistant for a Hackathon. Answer the user's question based ONLY on the provided context.

Context:
{context}

Question: {question}

Return a strictly valid JSON object with the following keys:
- "answer": A direct, helpful response to the question.
- "confidence": A score from 0.0 to 1.0 indicating how confident you are in the answer based on the context.
"""

    return call_json(prompt)

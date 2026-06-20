import asyncio
import os
import sys
from celery import Celery
from psycopg2.extras import Json
from dotenv import load_dotenv

load_dotenv()

# Add project root to sys.path to resolve participant_ai
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.database import execute
from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch
from participant_ai.pipelines.bias.analyzer import BiasDetectionService
from backend.app.database import fetch_all

# Initialize Celery App
celery_app = Celery(
    "hackathon_worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_concurrency=2, # Keep it low to prevent OOM locally
)

@celery_app.task(name="process_resume_task")
def process_resume_task(user_id: str, raw_text: str):
    """
    Background worker task to parse resume and update PostgreSQL.
    """
    async def run_async():
        results = await parse_and_vectorize_batch([raw_text], max_concurrency=1)
        return results
        
    try:
        results = asyncio.run(run_async())
        parsed, vector, embedding, breakdown = results[0]
        
        # Ensure vector is a valid dict
        vector_dict = vector.to_dict() if hasattr(vector, 'to_dict') else (vector if isinstance(vector, dict) else {})
        
        # Extract declared skills from parsed data
        raw_skills = parsed.raw_skills if parsed and hasattr(parsed, 'raw_skills') else []
        
        # Format embedding as a string array for pgvector
        embedding_str = f"[{','.join(map(str, embedding))}]" if embedding else None
        
        # Update participants table
        execute(
            """
            UPDATE participants 
            SET skill_vector = %s, 
                declared_skills = ARRAY(
                    SELECT DISTINCT unnest(COALESCE(declared_skills, ARRAY[]::text[]) || %s::text[])
                ),
                semantic_embedding = %s
            WHERE user_id = %s
            """, 
            (Json(vector_dict), raw_skills, embedding_str, user_id)
        )
        print(f"[Celery] Successfully processed background LLM parsing for user {user_id}")
        return {"status": "success", "user_id": user_id}
    except Exception as e:
        print(f"[Celery Error] Task failed for user {user_id}: {e}")
        return {"status": "failed", "error": str(e)}

@celery_app.task(name="detect_bias_task")
def detect_bias_task(hackathon_id: str):
    """
    Background worker task to run statistical bias detection algorithms.
    """
    try:
        BiasDetectionService.analyze(hackathon_id, fetch_all, execute)
        return {"status": "success", "hackathon_id": hackathon_id}
    except Exception as e:
        print(f"[Celery Error] Bias detection failed: {e}")
        return {"status": "failed", "error": str(e)}

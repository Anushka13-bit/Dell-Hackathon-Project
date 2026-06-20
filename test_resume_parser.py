import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Ensure backend modules can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

async def test_parser():
    resume_text = """
    Atharva Mendhulkar
    atharva@example.com
    B.Tech Computer Science, 2024
    
    Skills:
    Python, React, Next.js, Node.js, Postgres
    
    Experience:
    Built a scalable backend system using Python and FastAPI. Designed frontend using React and Next.js.
    
    Projects:
    - Hackathon AI: Agentic system for hackathons
    - Dashboard UI: A responsive Next.js dashboard
    """
    
    print("Running parser...")
    results = await parse_and_vectorize_batch([resume_text], max_concurrency=1)
    
    parsed, vector, embedding, breakdown = results[0]
    
    print("\n--- Parsed Resume ---")
    print(parsed)
    
    print("\n--- Skill Vector ---")
    if hasattr(vector, 'to_dict'):
        print(vector.to_dict())
    else:
        print(vector)
        
    print("\n--- Breakdown ---")
    print(breakdown)

if __name__ == "__main__":
    asyncio.run(test_parser())

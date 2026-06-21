import asyncio
import io
import os
from dotenv import load_dotenv

load_dotenv("../.env")

async def test():
    text = "Hello my name is John Doe and my skills are Python, React, and Machine Learning."
    
    try:
        from app.services.ai.pipelines.resume_rag.parser import parse_and_vectorize_batch
        results = await parse_and_vectorize_batch([text], max_concurrency=1)
        print("Success:", results)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())

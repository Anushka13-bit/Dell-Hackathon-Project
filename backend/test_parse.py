import asyncio
from fastapi import UploadFile
import io

async def test():
    with open("dummy.pdf", "rb") as f:
        content = f.read()
    
    try:
        import pypdf
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        print("Success:", text)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())

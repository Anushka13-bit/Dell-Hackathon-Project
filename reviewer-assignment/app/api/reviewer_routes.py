from pathlib import Path
import tempfile

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form
)

from app.ingestion.resume_ingestion import (
    process_resume
)

from app.db.reviewer_repository import (
    save_reviewer
)

router = APIRouter(
    prefix="/reviewers",
    tags=["Reviewers"]
)


@router.post("/upload-resume")
async def upload_resume(
    name: str = Form(...),
    resume: UploadFile = File(...)
):

    suffix = Path(
        resume.filename
    ).suffix

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_file:

        content = await resume.read()

        temp_file.write(
            content
        )

        temp_path = (
            temp_file.name
        )

    reviewer = process_resume(
        name=name,
        pdf_path=temp_path
    )

    saved_reviewer = save_reviewer(
        reviewer
    )

    return {
        "reviewer_id":
            str(
                saved_reviewer.reviewer_id
            ),
        "name":
            saved_reviewer.name,
        "primary_specialization":
            saved_reviewer.primary_specialization,
        "secondary_specializations":
            saved_reviewer.secondary_specializations,
        "skill_vector":
            saved_reviewer.skill_vector
    }

"""
Reviewer APIs

Endpoints:

POST /reviewers/upload-resume
    Accepts a reviewer resume PDF and performs:
    - PDF text extraction
    - LLM-based skill extraction
    - Skill categorization
    - Confidence vector generation
    - Primary specialization detection
    - Reviewer persistence

Returns the generated reviewer profile,
specializations, and skill vector.
"""
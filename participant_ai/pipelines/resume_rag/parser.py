"""Resume parsing and skill vectorization — high-volume async Gemini calls.

PDF/DOCX text extraction is out of scope; resume_text must already be plain text.
"""

from __future__ import annotations

import asyncio
import json
import logging

from participant_ai.core.llm import call_json_async
from participant_ai.core.schemas import ParsedResume, SkillVector
from participant_ai.pipelines.resume_rag.skill_scoring import compute_skill_vector

logger = logging.getLogger(__name__)


def _parse_prompt(resume_text: str) -> str:
    return f"""Extract structured data from this resume text.

Return JSON with keys:
- name (string or null)
- college_name (string or null)
- github_url (string or null — only if explicitly present, never invent)
- raw_skills (array of strings — skills/tech as literally written)
- experience_summary (string, 2-3 sentences)
- projects (array of strings — short descriptions of each project mentioned)

If unsure about a field, return null or empty — do NOT fabricate name/college/github_url.

Resume:
{resume_text}
"""


def _coerce_parsed(data: dict) -> ParsedResume:
    raw_skills = data.get("raw_skills", [])
    if not isinstance(raw_skills, list):
        raw_skills = []
    summary = data.get("experience_summary") or ""
    if not isinstance(summary, str):
        summary = str(summary)
    projects = data.get("projects", [])
    if not isinstance(projects, list):
        projects = []
        
    return ParsedResume(
        name=str(data["name"]) if data.get("name") else None,
        college_name=str(data["college_name"]) if data.get("college_name") else None,
        github_url=str(data["github_url"]) if data.get("github_url") else None,
        raw_skills=[str(s) for s in raw_skills if s],
        experience_summary=summary,
        projects=[str(p) for p in projects if p],
    )


async def parse_resume_async(resume_text: str) -> ParsedResume:
    """Parse raw resume text into structured fields."""
    return _coerce_parsed(await call_json_async(_parse_prompt(resume_text)))


async def parse_and_vectorize_batch(
    resume_texts: list[str],
    max_concurrency: int = 10,
) -> list[tuple[ParsedResume, SkillVector, dict]]:
    """Parse and vectorize all resumes with bounded concurrency.

    One person = parse then vectorize (sequential). Many people run in parallel
    via Semaphore. Results preserve input order for zipping to participant IDs.
    """
    semaphore = asyncio.Semaphore(max_concurrency)

    async def _one(text: str) -> tuple[ParsedResume, SkillVector, dict]:
        async with semaphore:
            parsed = await parse_resume_async(text)
            vector, breakdown = await compute_skill_vector(text, parsed.projects)
            return parsed, vector, breakdown

    return await asyncio.gather(
        *[_one(text) for text in resume_texts]
    )

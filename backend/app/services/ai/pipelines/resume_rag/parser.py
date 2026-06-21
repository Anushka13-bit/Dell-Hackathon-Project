"""Resume parsing and skill vectorization — high-volume async Gemini calls.

PDF/DOCX text extraction is out of scope; resume_text must already be plain text.
"""

from __future__ import annotations

import asyncio
import json
import logging

from app.services.ai.core.llm import call_json_async
from app.services.ai.core.schemas import ParsedResume, SkillVector
from app.services.ai.pipelines.resume_rag.skill_scoring import compute_skill_vector

logger = logging.getLogger(__name__)


def _parse_prompt(resume_text: str) -> str:
    return f"""Extract structured data from this resume text.

Return JSON with keys:
- name (string or null)
- phone (string or null)
- gender (string or null — infer from the candidate's name if not explicitly stated, e.g. Male, Female, or return null if unsure)
- college_name (string or null)
- degree (string or null — extract the exact degree mentioned (e.g., B.Tech, BS, MS, PhD))
- year_of_study (string or null — extract the year of study, e.g. "3rd Year", "Senior", "2024", etc.)
- github_url (string or null — only if explicitly present, never invent)
- linkedin_url (string or null — only if explicitly present, never invent)
- raw_skills (array of strings — skills/tech as literally written)
- experience_summary (string, 2-3 sentences)
- projects (array of strings — short descriptions of each project mentioned)

If unsure about a field, return null or empty — do NOT fabricate name/college/year_of_study/github_url/linkedin_url.

Resume:
{resume_text}
"""


def _coerce_parsed(data: dict, resume_text: str) -> ParsedResume:
    raw_skills = data.get("raw_skills", [])
    if not isinstance(raw_skills, list):
        raw_skills = []
    summary = data.get("experience_summary") or ""
    if not isinstance(summary, str):
        summary = str(summary)
    projects = data.get("projects", [])
    if not isinstance(projects, list):
        projects = []
        
    github_url = str(data["github_url"]).strip() if data.get("github_url") else None
    if github_url:
        if not github_url.startswith("http://") and not github_url.startswith("https://"):
            if not github_url.startswith("www."):
                github_url = "https://www." + github_url
            else:
                github_url = "https://" + github_url
                
    linkedin_url = str(data["linkedin_url"]).strip() if data.get("linkedin_url") else None
    if linkedin_url:
        if not linkedin_url.startswith("http://") and not linkedin_url.startswith("https://"):
            if not linkedin_url.startswith("www."):
                linkedin_url = "https://www." + linkedin_url
            else:
                linkedin_url = "https://" + linkedin_url
        
    degree = str(data["degree"]) if data.get("degree") else None
    deg_low = (degree or "").lower()
    res_low = resume_text.lower()
    if "b.tech" in deg_low or "btech" in deg_low:
        degree = "B.Tech"
    elif "b.e" in deg_low:
        degree = "B.E."
    elif "b.tech" in res_low or "btech" in res_low:
        degree = "B.Tech"
    elif "b.e." in res_low or "b e " in res_low:
        degree = "B.E."
    elif "bachelor" in deg_low or "bachelor" in res_low:
        degree = "Bachelor"
        
    phone = str(data["phone"]) if data.get("phone") else None
    if phone:
        phone = phone.strip()
        if phone.startswith("+91"):
            phone = phone.replace("+91", "").strip("- ")
        elif phone.startswith("+1"):
            phone = phone.replace("+1", "").strip("- ")
        elif phone.startswith("91") and len(phone) > 10:
            phone = phone[2:].strip("- ")
            
        phone = f"+91 {phone}"
            
    return ParsedResume(
        name=str(data["name"]) if data.get("name") else None,
        phone=phone,
        gender=str(data["gender"]) if data.get("gender") else None,
        college_name=str(data["college_name"]) if data.get("college_name") else None,
        degree=degree,
        year_of_study=str(data["year_of_study"]) if data.get("year_of_study") else None,
        github_url=github_url,
        linkedin_url=linkedin_url,
        raw_skills=[str(s) for s in raw_skills if s],
        experience_summary=summary,
        projects=[str(p) for p in projects if p],
    )


async def parse_resume_async(resume_text: str) -> ParsedResume:
    """Parse raw resume text into structured fields."""
    return _coerce_parsed(await call_json_async(_parse_prompt(resume_text)), resume_text)


async def parse_and_vectorize_batch(
    resume_texts: list[str],
    max_concurrency: int = 10,
) -> list[tuple[ParsedResume, SkillVector, list[float], dict]]:
    """Parse and vectorize all resumes with bounded concurrency.

    One person = parse then vectorize (sequential). Many people run in parallel
    via Semaphore. Results preserve input order for zipping to participant IDs.
    """
    semaphore = asyncio.Semaphore(max_concurrency)

    async def _one(text: str) -> tuple[ParsedResume, SkillVector, list[float], dict]:
        async with semaphore:
            parsed = await parse_resume_async(text)
            vector, embedding, breakdown = await compute_skill_vector(text, parsed.projects, {})
            return parsed, vector, embedding, breakdown

    return await asyncio.gather(
        *[_one(text) for text in resume_texts]
    )

import json
import logging
from typing import Tuple

from participant_ai.core.llm import call_json_async
from participant_ai.core.schemas import SkillVector
from participant_ai.core.skill_taxonomy import SKILL_TAXONOMY, category_names

logger = logging.getLogger(__name__)

WEIGHT_KEYWORD = 0.4
WEIGHT_PROJECT = 0.3
WEIGHT_LLM = 0.3

def keyword_score(resume_text: str, category: str, match_cap: int = 5) -> float:
    """Deterministic. Count case-insensitive occurrences of each keyword for this
    category anywhere in resume_text. score = min(total_matches, match_cap) / match_cap.
    No API call. Returns 0.0 if category not in taxonomy."""
    if category not in SKILL_TAXONOMY:
        return 0.0
    text_lower = resume_text.lower()
    keywords = SKILL_TAXONOMY[category]["keywords"]
    matches = 0
    for kw in keywords:
        matches += text_lower.count(kw.lower())
        if matches >= match_cap:
            break
    return min(matches, match_cap) / match_cap

def project_evidence(projects: list[str], category: str, project_cap: int = 3) -> float:
    """Deterministic. Count how many distinct projects mention at least one keyword.
    score = min(matching_project_count, project_cap) / project_cap."""
    if category not in SKILL_TAXONOMY:
        return 0.0
    keywords = [kw.lower() for kw in SKILL_TAXONOMY[category]["keywords"]]
    matches = 0
    for proj in projects:
        proj_lower = proj.lower()
        if any(kw in proj_lower for kw in keywords):
            matches += 1
    return min(matches, project_cap) / project_cap

async def llm_score_all_categories(resume_text: str, projects: list[str]) -> dict[str, float]:
    """The ONE Groq call per resume. Build the prompt by injecting category_names()."""
    valid_categories = category_names()
    prompt = f"""Score this participant across exact skill categories based on evidence.

Return JSON with ONE key "skill_vector", an object with EXACTLY these keys:
{json.dumps(valid_categories)}

Score ONLY these exact categories. Do not invent, add, or rename categories.
Each value 0.0-1.0 = strength of evidence.

Resume Evidence:
- Projects: {json.dumps(projects)}
- Snippet: {resume_text[:2000]}

Strict JSON only."""
    response = await call_json_async(prompt)
    raw = response.get("skill_vector", {})
    if not isinstance(raw, dict):
        raw = {}
    
    # Safely extract floats
    cleaned = {}
    for k in valid_categories:
        try:
            cleaned[k] = float(raw.get(k, 0.0))
        except (ValueError, TypeError):
            cleaned[k] = 0.0
            
    return cleaned

async def compute_skill_vector(resume_text: str, projects: list[str]) -> Tuple[SkillVector, dict]:
    """Combines all three components using the weighted formula."""
    valid_cats = category_names()
    breakdown_dict = {}
    
    # 1. Deterministic instant scores
    kw_scores = {cat: keyword_score(resume_text, cat) for cat in valid_cats}
    proj_scores = {cat: project_evidence(projects, cat) for cat in valid_cats}
    
    # 2. Network call for LLM scores
    llm_scores = await llm_score_all_categories(resume_text, projects)
    
    # 3. Combine
    final_scores = {}
    for cat in valid_cats:
        kw = kw_scores[cat]
        proj = proj_scores[cat]
        llm = llm_scores.get(cat, 0.0)
        
        final = max(0.0, min(1.0, (WEIGHT_KEYWORD * kw) + (WEIGHT_PROJECT * proj) + (WEIGHT_LLM * llm)))
        
        final_scores[cat] = final
        breakdown_dict[cat] = {
            "keyword": round(kw, 2),
            "project": round(proj, 2),
            "llm": round(llm, 2),
            "final": round(final, 2)
        }
        
    vector = SkillVector.from_dict(final_scores)
    return vector, breakdown_dict

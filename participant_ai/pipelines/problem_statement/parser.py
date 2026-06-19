"""Problem statement NLP — low-volume sync Gemini calls."""

from __future__ import annotations

import json
import logging

from participant_ai.core.llm import call_json
from participant_ai.core.schemas import PSRequirement, SkillVector
from participant_ai.core.skill_taxonomy import category_names

logger = logging.getLogger(__name__)


def _prompt(raw_text: str, title: str) -> str:
    categories = json.dumps(category_names())
    return f"""Analyze this hackathon problem statement.

Return JSON with one key "required_vector": an object with EXACTLY these keys:
{categories}

Each value is a float 0.0-1.0 for how important that domain is to the ideal team.

Important:
- Do NOT collapse to near-zero on all but one category. Even ML-heavy projects need
  meaningful backend, frontend, and devops scores (e.g. 0.2-0.5), not 0.01.
  Team formation uses this texture to diversify members across domains.
- Use ONLY the 9 keys above. Strict JSON, no commentary.

Title: {title}

Problem statement:
{raw_text}
"""


def parse_ps(
    raw_text: str,
    title: str,
    ps_id: str,
    team_size: int = 4,
) -> PSRequirement:
    """Parse a problem statement into structured skill requirements."""
    result = call_json(_prompt(raw_text, title))
    raw_vector = result.get("required_vector", {})
    if not isinstance(raw_vector, dict):
        logger.warning("Gemini returned non-dict required_vector; using zeros.")
        raw_vector = {}

    valid_categories = set(category_names())
    extra = set(raw_vector) - valid_categories
    if extra:
        logger.warning("Dropping extra PS vector keys: %s", sorted(extra))

    return PSRequirement(
        ps_id=ps_id,
        title=title,
        raw_text=raw_text,
        required_vector=SkillVector.from_dict(raw_vector),
        team_size=team_size,
    )

import json
from typing import Dict

from participant_ai.core.llm import call_json
from backend.app.models.hackathon import Hackathon
from backend.app.models.problem_statement import ProblemStatement


def generate_promotional_content(
    hackathon: Hackathon, problem_statements: list[ProblemStatement]
) -> Dict[str, str]:
    """Generates promotional content for different platforms."""

    ps_descriptions = "\n".join(
        [f"- {ps.title}: {ps.raw_text[:200]}..." for ps in problem_statements]
    )

    prompt = f"""
You are an expert tech event marketer. Write promotional drafts for the upcoming hackathon.
The hackathon details are:
Name: {hackathon.title}
Theme: {hackathon.description}
Start Date: {hackathon.start_date}
End Date: {hackathon.end_date}

Problem Statements:
{ps_descriptions}

Generate engaging promotional content tailored for three platforms.
Return a strictly valid JSON object with the following keys:
- "twitter": A thread or single post optimized for X/Twitter (include emojis and hashtags).
- "linkedin": A professional, inspiring post optimized for LinkedIn.
- "email": A promotional email draft targeting university students and professionals.
"""

    return call_json(prompt)

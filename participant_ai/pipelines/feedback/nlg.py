import json
from typing import Dict, List

from participant_ai.core.llm import call_json


def generate_team_feedback(
    team_name: str,
    project_title: str,
    project_description: str,
    evaluations: List[Dict[str, float]],
    global_average_score: float,
) -> Dict[str, str]:
    """Generates personalized, constructive feedback for a team based on reviewer scores."""

    avg_team_score = sum(e["score"] for e in evaluations) / len(evaluations) if evaluations else 0
    
    score_context = ""
    if avg_team_score > global_average_score:
        score_context = "This team scored ABOVE the hackathon average. Focus on what made them stand out and minor areas for polish."
    else:
        score_context = "This team scored BELOW the hackathon average. Provide encouraging but constructive feedback on how they can improve."

    reviewer_comments = "\n".join(
        [f"- Reviewer {i+1}: Score: {e['score']}, Comment: {e.get('feedback', 'None')}" for i, e in enumerate(evaluations)]
    )

    prompt = f"""
You are an empathetic, expert hackathon judge. Write personalized feedback for the team.

Team: {team_name}
Project: {project_title}
Description: {project_description}

{score_context}
Team Average Score: {avg_team_score:.2f}
Global Average Score: {global_average_score:.2f}

Reviewer Notes:
{reviewer_comments}

Return a strictly valid JSON object with the following keys:
- "feedback_text": A well-structured, 2-3 paragraph constructive feedback message addressing the team directly (e.g., "Great job on...").
"""

    return call_json(prompt)

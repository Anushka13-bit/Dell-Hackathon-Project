from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.evaluation import Evaluation
from ..models.idea_submission import IdeaSubmission

router = APIRouter()


class LeaderboardEntry(BaseModel):
    idea_id: str
    title: Optional[str] = None
    team_id: Optional[str] = None
    total_score: float
    num_evaluations: int
    avg_score: float
    normalized_score: float = 0.0
    ranking_confidence: float = 0.0


def calculate_krippendorff_alpha(idea_scores: list[float], global_variance: float) -> float:
    """
    Approximation of inter-rater reliability for a specific idea.
    If global variance is 0, alpha is 0.
    1.0 means perfect agreement (zero variance between reviewers).
    """
    if len(idea_scores) < 2 or global_variance == 0:
        return 0.0
    import numpy as np
    idea_var = np.var(idea_scores, ddof=1) if len(idea_scores) > 1 else 0
    # 1 - (observed disagreement / expected disagreement)
    alpha = 1.0 - (idea_var / global_variance)
    return max(0.0, min(1.0, alpha))


@router.get("/", response_model=List[LeaderboardEntry])
async def get_leaderboard(db: Session = Depends(get_db)):
    """
    Calculate final leaderboard by applying Z-score normalization per reviewer,
    calculating ranking confidence (IRR), and resolving ties.
    """
    evals = db.query(Evaluation).all()
    if not evals:
        return []

    import numpy as np
    from collections import defaultdict
    
    # 1. Calculate Reviewer Statistics
    reviewer_scores = defaultdict(list)
    for e in evals:
        if e.score is not None:
            reviewer_scores[e.reviewer_id].append(e.score)
            
    reviewer_stats = {}
    all_valid_scores = []
    for rid, scores in reviewer_scores.items():
        reviewer_stats[rid] = {
            "mean": np.mean(scores),
            "std": np.std(scores) if len(scores) > 1 else 0.0
        }
        all_valid_scores.extend(scores)
        
    global_mean = np.mean(all_valid_scores)
    global_std = np.std(all_valid_scores)
    global_var = np.var(all_valid_scores, ddof=1) if len(all_valid_scores) > 1 else 1.0

    # 2. Normalize Scores & Group by Idea
    idea_metrics = defaultdict(lambda: {"raw_scores": [], "norm_scores": [], "evals": 0})
    for e in evals:
        if e.score is None:
            continue
            
        r_stat = reviewer_stats[e.reviewer_id]
        # Z-score normalization
        if r_stat["std"] > 0:
            z = (e.score - r_stat["mean"]) / r_stat["std"]
            norm_score = (z * global_std) + global_mean
        else:
            norm_score = e.score # fallback if std is 0
            
        idea_metrics[e.idea_id]["raw_scores"].append(e.score)
        idea_metrics[e.idea_id]["norm_scores"].append(norm_score)
        idea_metrics[e.idea_id]["evals"] += 1

    # 3. Compile Leaderboard
    leaderboard = []
    for idea_id, metrics in idea_metrics.items():
        idea = db.query(IdeaSubmission).filter(IdeaSubmission.idea_id == idea_id).first()
        
        raw_avg = np.mean(metrics["raw_scores"])
        norm_avg = np.mean(metrics["norm_scores"])
        total = sum(metrics["raw_scores"])
        
        # Ranking Confidence
        alpha = calculate_krippendorff_alpha(metrics["norm_scores"], global_var)
        # Weight by number of evaluations (e.g. 3 is standard)
        confidence = alpha * min(1.0, metrics["evals"] / 3.0)
        
        leaderboard.append(
            LeaderboardEntry(
                idea_id=str(idea_id),
                title=idea.title if idea else None,
                team_id=str(idea.team_id) if idea and idea.team_id else None,
                total_score=float(total),
                num_evaluations=int(metrics["evals"]),
                avg_score=float(raw_avg),
                normalized_score=float(norm_avg),
                ranking_confidence=float(confidence)
            )
        )

    # 4. Tie Resolution Cascade (PRD §14.5)
    # Sort by: Normalized Score (DESC) -> Ranking Confidence (DESC) -> Total Evals (DESC)
    leaderboard.sort(key=lambda x: (x.normalized_score, x.ranking_confidence, x.num_evaluations), reverse=True)

    return leaderboard

# This computes and stores the reviewer statistics needed by normalization.

import numpy as np
from scipy.stats import median_abs_deviation
from sqlalchemy.orm import Session

from app.models.reviewer_stats import (
    ReviewerStats
)

from app.models.evaluation import (
    Evaluation
)

MIN_REVIEWS = 5


def compute_reviewer_stats(
    db: Session,
    reviewer_id
):
    evaluations = (
        db.query(Evaluation)
        .filter(
            Evaluation.reviewer_id
            == reviewer_id
        )
        .all()
    )

    scores = [
        e.score
        for e in evaluations
    ]

    if not scores:
        return None

    review_count = len(scores)

    mean_score = float(
        np.mean(scores)
    )

    median_score = float(
        np.median(scores)
    )

    score_std = float(
        np.std(
            scores,
            ddof=1
        )
    )

    score_mad = float(
        median_abs_deviation(
            scores,
            scale="normal"
        )
    )

    coefficient_variation = (
        score_std / mean_score
        if mean_score > 0
        else 0
    )

    stats = db.get(
        ReviewerStats,
        reviewer_id
    )

    if stats is None:

        stats = ReviewerStats(
            reviewer_id=reviewer_id
        )

        db.add(stats)

    stats.review_count = review_count
    stats.mean_score = mean_score
    stats.median_score = median_score
    stats.score_std = score_std
    stats.score_mad = score_mad
    stats.coefficient_variation = coefficient_variation

    return stats
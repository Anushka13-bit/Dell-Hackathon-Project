import numpy as np
from sqlalchemy.orm import Session

from app.models.reviewer_stats import (
    ReviewerStats
)

from app.models.normalised_score import (
    NormalizedScore
)

from app.models.evaluation import (
    Evaluation
)

from app.services.fairness_engine.reviewer_stats_service import (
    compute_reviewer_stats
)
MIN_REVIEWS = 5
EPSILON = 1e-6


def compute_global_distribution(db: Session):
    scores = [
        row.score
        for row in db.query(Evaluation).all()
    ]

    if not scores:
        return 0.0, 1.0

    return (
        float(np.mean(scores)),
        float(np.std(scores, ddof=1))
    )


def zscore_normalize(
    raw_score,
    reviewer_mean,
    reviewer_std
):
    return (
        raw_score - reviewer_mean
    ) / reviewer_std


def mad_normalize(
    raw_score,
    median_score,
    mad
):
    return (
        raw_score - median_score
    ) / mad


def global_rescale(
    normalized_score,
    global_mean,
    global_std
):
    return (
        normalized_score
        * global_std
        + global_mean
    )


def normalize_evaluation(
    db: Session,
    evaluation: Evaluation,
    global_mean: float,
    global_std: float,
    existing_scores: dict,
    reviewer_stats_map: dict
):
    reviewer_stats = reviewer_stats_map.get(
    evaluation.reviewer_id
    )
    if reviewer_stats is None:
        return

    raw_score = evaluation.score

    # --------------------------------------------------
    # Not enough reviewer history
    # --------------------------------------------------

    if reviewer_stats.review_count < MIN_REVIEWS:

        normalized = raw_score
        final_score = raw_score

    else:

        # --------------------------------------------------
        # Standard Z-score normalization
        # --------------------------------------------------

        if reviewer_stats.score_std > EPSILON:

            normalized = zscore_normalize(
                raw_score,
                reviewer_stats.mean_score,
                reviewer_stats.score_std
            )

        # --------------------------------------------------
        # Robust MAD fallback
        # --------------------------------------------------

        else:

            if reviewer_stats.score_mad < EPSILON:

                normalized = 0

            else:

                normalized = mad_normalize(
                    raw_score,
                    reviewer_stats.median_score,
                    reviewer_stats.score_mad
                )

        final_score = global_rescale(
            normalized,
            global_mean,
            global_std
        )

    existing = existing_scores.get(
    evaluation.evaluation_id
    )

    if existing:

        existing.raw_score = raw_score
        existing.normalized_score = normalized
        existing.final_score = final_score

    else:

        db.add(
            NormalizedScore(
                evaluation_id=evaluation.evaluation_id,
                reviewer_id=evaluation.reviewer_id,
                raw_score=raw_score,
                normalized_score=normalized,
                final_score=final_score
            )
        )


def normalize_round(
    db: Session
):
    evaluations = db.query(Evaluation).all()

    reviewer_ids = {
        e.reviewer_id
        for e in evaluations
    }

    # --------------------------------------------------
    # Compute reviewer statistics first
    # --------------------------------------------------

    for reviewer_id in reviewer_ids:

        compute_reviewer_stats(
            db,
            reviewer_id
        )

    # --------------------------------------------------
    # Compute global distribution ONCE
    # --------------------------------------------------

    global_mean, global_std = (
        compute_global_distribution(db)
    )

    # --------------------------------------------------
    # Normalize all evaluations
    # --------------------------------------------------

    existing_scores = {
    row.evaluation_id: row
    for row in db.query(
        NormalizedScore
    ).all()
    }

    reviewer_stats_map = {
        row.reviewer_id: row
        for row in db.query(
            ReviewerStats
        ).all()
    }

    for evaluation in evaluations:

        normalize_evaluation(
            db,
            evaluation,
            global_mean,
            global_std,
            existing_scores,
            reviewer_stats_map
        )

    # --------------------------------------------------
    # Single commit
    # --------------------------------------------------

    db.commit()
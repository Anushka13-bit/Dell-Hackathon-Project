import numpy as np

from app.models.evaluation import (
    Evaluation
)

from app.models.ranking_confidence import (
    RankingConfidence
)

REQUIRED_REVIEWS = 4


def get_confidence_level(score):

    if score >= 85:
        return "HIGH"

    if score >= 65:
        return "MEDIUM"

    return "LOW"


def compute_ranking_confidence(db):

    idea_ids = {
        row.idea_id
        for row in db.query(Evaluation).all()
    }

    for idea_id in idea_ids:

        reviews = (
            db.query(Evaluation)
            .filter(
                Evaluation.idea_id == idea_id
            )
            .all()
        )

        if not reviews:
            continue

        scores = [
            float(r.score)
            for r in reviews
            if r.score is not None
        ]

        if len(scores) == 0:
            continue

        # ------------------------------------
        # REVIEW COVERAGE
        # ------------------------------------

        review_coverage = min(
            1.0,
            len(scores) / REQUIRED_REVIEWS
        )

        # ------------------------------------
        # REVIEWER AGREEMENT
        # LOW STD = HIGH AGREEMENT
        # ------------------------------------

        if len(scores) == 1:

            agreement_score = 0.5

        else:

            std = float(
                np.std(
                    scores,
                    ddof=1
                )
            )

            agreement_score = max(
                0.0,
                1.0 - (std / 10.0)
            )

        # ------------------------------------
        # FINAL CONFIDENCE
        # ------------------------------------

        confidence_score = (
            (
                0.6 * agreement_score
            )
            +
            (
                0.4 * review_coverage
            )
        ) * 100

        confidence_level = (
            get_confidence_level(
                confidence_score
            )
        )

        existing = (
            db.query(
                RankingConfidence
            )
            .filter(
                RankingConfidence.idea_id
                == idea_id
            )
            .first()
        )

        if existing:

            existing.agreement_score = agreement_score

            existing.review_coverage = (
                review_coverage
            )

            existing.confidence_score = (
                confidence_score
            )

            existing.confidence_level = (
                confidence_level
            )

        else:

            db.add(
                RankingConfidence(
                    idea_id=idea_id,
                    agreement_score=agreement_score,
                    review_coverage=review_coverage,
                    confidence_score=confidence_score,
                    confidence_level=confidence_level
                )
            )

    db.commit()
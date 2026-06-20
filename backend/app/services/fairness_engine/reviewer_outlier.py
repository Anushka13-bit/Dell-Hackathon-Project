import numpy as np

from app.models.reviewer_stats import (
    ReviewerStats
)

from app.models.bias_alert import (
    BiasAlert
)

WARNING_THRESHOLD = 2.0
CRITICAL_THRESHOLD = 3.0

MIN_REVIEWS = 5


def run_outlier_detection(db):

    reviewers = (
        db.query(ReviewerStats)
        .all()
    )

    if len(reviewers) < 2:
        return

    reviewer_means = [
        r.mean_score
        for r in reviewers
        if r.review_count >= MIN_REVIEWS
    ]

    if len(reviewer_means) < 2:
        return

    population_mean = float(
        np.mean(reviewer_means)
    )

    population_std = float(
        np.std(
            reviewer_means,
            ddof=1
        )
    )

    if population_std == 0:
        return

    for reviewer in reviewers:

        if reviewer.review_count < MIN_REVIEWS:
            continue

        z_score = (
            reviewer.mean_score
            - population_mean
        ) / population_std

        reviewer.z_score = float(z_score)

        severity = None

        if abs(z_score) >= CRITICAL_THRESHOLD:
            severity = "CRITICAL"

        elif abs(z_score) >= WARNING_THRESHOLD:
            severity = "WARNING"

        if not severity:
            continue

        existing = (
            db.query(BiasAlert)
            .filter(
                BiasAlert.alert_type
                == "REVIEWER_OUTLIER",
                BiasAlert.reviewer_id
                == reviewer.reviewer_id,
                BiasAlert.status
                == "OPEN"
            )
            .first()
        )

        if existing:
            continue

        db.add(
            BiasAlert(
                reviewer_id=reviewer.reviewer_id,
                alert_type="REVIEWER_OUTLIER",
                severity=severity,
                p_value=None,
                effect_size=float(
                    abs(z_score)
                ),
                description=(
                    f"Reviewer mean score "
                    f"deviates significantly "
                    f"from reviewer population "
                    f"(z={z_score:.2f})"
                )
            )
        )

    db.commit()
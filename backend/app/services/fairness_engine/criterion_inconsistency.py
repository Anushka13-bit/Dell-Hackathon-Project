from app.models.reviewer_stats import ReviewerStats
from app.models.bias_alert import BiasAlert


CV_THRESHOLD = 0.50


def run_criterion_inconsistency(db):

    reviewers = (
        db.query(ReviewerStats)
        .all()
    )

    for reviewer in reviewers:

        cv = (
            reviewer.coefficient_variation
        )

        if cv > CV_THRESHOLD:

            db.add(
                BiasAlert(
                    reviewer_id=reviewer.reviewer_id,
                    alert_type="CRITERION_INCONSISTENCY",
                    test_name="COEFFICIENT_VARIATION",
                    severity="WARNING",
                    effect_size=cv,
                    description=(
                        f"Reviewer scoring "
                        f"inconsistency detected "
                        f"(CV={cv:.2f})"
                    )
                )
            )

    db.commit()
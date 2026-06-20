import time

from app.services.fairness_engine.score_normalisation import (
    normalize_round
)

from app.services.fairness_engine.reviewer_outlier import (
    run_outlier_detection
)

from app.services.fairness_engine.temporal_drift import (
    detect_temporal_drift
)

from app.services.fairness_engine.criterion_inconsistency import (
    run_criterion_inconsistency
)

from app.services.fairness_engine.institutional_bias import (
    detect_institutional_bias
)

from app.services.fairness_engine.gender_bias import (
    detect_gender_bias
)

from app.services.fairness_engine.technology_stack_bias import (
    detect_technology_stack_bias
)

from app.services.fairness_engine.ranking_confidence import (
    compute_ranking_confidence
)

from app.services.fairness_engine.fairness_validation_report import (
    generate_fairness_report
)

from app.models.reviewer_stats import (
    ReviewerStats
)

from app.models.bias_alert import (
    BiasAlert
)

from app.models.fairness_report import (
    FairnessReport
)

from app.models.ranking_confidence import (
    RankingConfidence
)

def run_fairness_pipeline(db, round_id):

    db.query(BiasAlert).delete()
    db.query(FairnessReport).delete()
    db.query(RankingConfidence).delete()
    db.commit()

    print(
        f"Starting fairness pipeline for round {round_id}"
    )

    db.flush()

    normalize_round(db)

    run_outlier_detection(db)

    reviewers = db.query(
        ReviewerStats
    ).all()

    for reviewer in reviewers:

        reviewer_id = reviewer.reviewer_id

        detect_temporal_drift(
            db,
            reviewer_id
        )

        detect_gender_bias(
            db,
            reviewer_id
        )

        detect_institutional_bias(
            db,
            reviewer_id
        )

        detect_technology_stack_bias(
            db,
            reviewer_id
        )

    run_criterion_inconsistency(db)

    compute_ranking_confidence(db)

    db.flush()

    generate_fairness_report(
        db,
        round_id
    )

    db.commit()

    print(
        f"Fairness pipeline complete "
        f"for round {round_id}"
    )
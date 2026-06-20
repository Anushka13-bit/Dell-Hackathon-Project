import uuid
import numpy as np

from app.models.bias_alert import (
    BiasAlert
)

from app.models.ranking_confidence import (
    RankingConfidence
)

from app.models.fairness_report import (
    FairnessReport
)

def determine_status(
    critical_alerts,
    low_confidence_ideas
):

    if critical_alerts > 0:
        return "MANUAL_REVIEW_REQUIRED"

    if low_confidence_ideas > 0:
        return "REVIEW_RECOMMENDED"

    return "READY_FOR_PUBLICATION"

def generate_fairness_report(
    db,
    round_id
):

    alerts = db.query(
        BiasAlert
    ).all()

    confidence_rows = db.query(
        RankingConfidence
    ).all()

    total_alerts = len(alerts)

    critical_alerts = sum(
        1
        for a in alerts
        if a.severity == "CRITICAL"
    )

    flagged_reviewers = len(
        {
            a.reviewer_id
            for a in alerts
            if a.reviewer_id is not None
        }
    )

    if confidence_rows:

        average_confidence = float(
            np.mean(
                [
                    r.confidence_score
                    for r in confidence_rows
                ]
            )
        )

    else:

        average_confidence = 0.0

    low_confidence_ideas = sum(
        1
        for r in confidence_rows
        if r.confidence_level == "LOW"
    )

    publication_status = (
        determine_status(
            critical_alerts,
            low_confidence_ideas
        )
    )

    report = FairnessReport(
        report_id=uuid.uuid4(),
        round_id=round_id,
        total_alerts=total_alerts,
        critical_alerts=critical_alerts,
        average_confidence=average_confidence,
        low_confidence_ideas=low_confidence_ideas,
        flagged_reviewers=flagged_reviewers,
        publication_status=publication_status
    )

    db.add(report)

    db.commit()

    print(
    "Alerts seen by report:",
    db.query(BiasAlert).count()
    )

    return report
from collections import defaultdict
import json

from scipy.stats import kruskal
from sqlalchemy import text

from app.models.bias_alert import (
    BiasAlert
)

from app.services.fairness_engine.severity_classifier import (
    classify_severity
)
ALPHA = 0.0083

# use 20 in production
MIN_GROUP_SIZE = 2


def dominant_stack(vector):

    if not vector:
        return None

    return max(
        vector.items(),
        key=lambda x: x[1]
    )[0]


def detect_technology_stack_bias(
    db,
    reviewer_id
):

    query = """
    SELECT
        e.score,
        i.idea_vector
    FROM evaluations e
    JOIN idea_submissions i
        ON e.idea_id = i.idea_id
    WHERE e.reviewer_id = :reviewer_id
    """

    rows = db.execute(
        text(query),
        {
            "reviewer_id": str(reviewer_id)
        }
    ).fetchall()

    stack_groups = defaultdict(list)

    for score, vector in rows:

        if vector is None:
            continue

        if isinstance(vector, str):
            vector = json.loads(vector)

        stack = dominant_stack(vector)

        if stack:
            stack_groups[stack].append(score)

    valid_groups = [
        scores
        for scores in stack_groups.values()
        if len(scores) >= MIN_GROUP_SIZE
    ]

    if len(valid_groups) < 2:
        return None

    h_stat, p_value = kruskal(
        *valid_groups
    )

    k = len(valid_groups)

    n = sum(
        len(group)
        for group in valid_groups
    )

    eta_sq = max(
        0,
        (h_stat - k + 1)
        / max(1, (n - k))
    )

    severity = classify_severity(
        p_value,
        eta_sq
    )

    if p_value < ALPHA:

        alert = BiasAlert(
            alert_type="TECH_STACK_BIAS",
            severity=severity,
            p_value=float(p_value),
            effect_size=float(eta_sq),
            reviewer_id=reviewer_id,
            description=(
                "Reviewer scores vary "
                "significantly across "
                "technology stacks"
            )
        )

        db.add(alert)
        db.flush()

        return alert

    return None
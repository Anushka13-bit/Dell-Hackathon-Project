from collections import defaultdict

from scipy.stats import mannwhitneyu
from sqlalchemy import text

from app.models.bias_alert import (
    BiasAlert
)

from app.services.fairness_engine.severity_classifier import (
    classify_severity
)

ADJUSTED_ALPHA = 0.0083
MIN_GROUP_SIZE = 2  # use 20 in production

def detect_gender_bias(
    db,
    reviewer_id
):

        query = """
        SELECT
            e.score,
            p.gender
        FROM evaluations e
        JOIN idea_submissions i
            ON e.idea_id = i.idea_id
        JOIN participants p
            ON i.team_id = p.team_id
        WHERE e.reviewer_id = :reviewer_id
          AND p.gender IS NOT NULL
        """

        rows = db.execute(
            text(query),
            {"reviewer_id": str(reviewer_id)}
        ).fetchall()

        gender_scores = defaultdict(list)

        for score, gender in rows:
            gender_scores[
                gender.lower().strip()
            ].append(score)

        if len(gender_scores) < 2:
            return None

        groups = list(gender_scores.keys())

        g1 = groups[0]
        g2 = groups[1]

        scores1 = gender_scores[g1]
        scores2 = gender_scores[g2]

        if (
            len(scores1) < MIN_GROUP_SIZE
            or len(scores2) < MIN_GROUP_SIZE
        ):
            return None

        stat, p_value = mannwhitneyu(
            scores1,
            scores2,
            alternative="two-sided"
        )

        rank_biserial = abs(
            1 - (
                2 * stat
            ) / (
                len(scores1)
                * len(scores2)
            )
        )

        severity = classify_severity(
            p_value,
            rank_biserial
        )

        mean1 = sum(scores1) / len(scores1)
        mean2 = sum(scores2) / len(scores2)

        if p_value < ADJUSTED_ALPHA:

            alert = BiasAlert(
                alert_type="GENDER_BIAS",
                severity=severity,
                p_value=float(p_value),
                effect_size=float(rank_biserial),
                reviewer_id=reviewer_id,
                group_a=g1,
                group_b=g2,
                test_name="MANN_WHITNEY_U",
                description=(
                    f"Reviewer shows scoring difference "
                    f"between {g1} and {g2}. "
                    f"Mean scores: {mean1:.2f} vs {mean2:.2f}"
                )
            )

            db.add(alert)

            db.flush()

            return alert

        return None

        
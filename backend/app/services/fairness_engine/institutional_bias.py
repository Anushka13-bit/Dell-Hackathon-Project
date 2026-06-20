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

# use 20 in production
MIN_GROUP_SIZE = 2


def detect_institutional_bias(
    db,
    reviewer_id
):

        query = """
        SELECT
            e.score,
            p.college_name
        FROM evaluations e
        JOIN idea_submissions i
            ON e.idea_id = i.idea_id
        JOIN participants p
            ON i.team_id = p.team_id
        WHERE e.reviewer_id = :reviewer_id
          AND p.college_name IS NOT NULL
        """

        rows = db.execute(
            text(query),
            {"reviewer_id": str(reviewer_id)}
        ).fetchall()

        college_scores = defaultdict(list)

        for score, college in rows:

            college_scores[
                college.strip()
            ].append(score)

        if len(college_scores) < 2:
            return None

        colleges = sorted(
            college_scores.items(),
            key=lambda x: len(x[1]),
            reverse=True
        )

        college_a, scores_a = colleges[0]
        college_b, scores_b = colleges[1]

        if (
            len(scores_a) < MIN_GROUP_SIZE
            or len(scores_b) < MIN_GROUP_SIZE
        ):
            return None

        stat, p_value = mannwhitneyu(
            scores_a,
            scores_b,
            alternative="two-sided"
        )

        rank_biserial = abs(
            1 - (
                2 * stat
            ) / (
                len(scores_a)
                * len(scores_b)
            )
        )

        severity = classify_severity(
            p_value,
            rank_biserial
        )

        mean_a = (
            sum(scores_a)
            / len(scores_a)
        )

        mean_b = (
            sum(scores_b)
            / len(scores_b)
        )

        if p_value < ADJUSTED_ALPHA:

            alert = BiasAlert(
                reviewer_id=reviewer_id,
                alert_type="INSTITUTIONAL_BIAS",
                severity=severity,
                p_value=float(p_value),
                effect_size=float(rank_biserial),
                group_a=college_a,
                group_b=college_b,
                test_name="MANN_WHITNEY_U",
                description=(
                    f"Reviewer shows scoring difference "
                    f"between {college_a} and "
                    f"{college_b}. "
                    f"Mean scores: "
                    f"{mean_a:.2f} vs {mean_b:.2f}"
                )
            )

            db.add(alert)
            db.flush()

            return alert

        return None

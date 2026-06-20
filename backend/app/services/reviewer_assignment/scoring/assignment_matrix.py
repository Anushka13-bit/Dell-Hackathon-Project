from backend.app.services.reviewer_assignment.scoring.compatibility_matrix import (
    build_compatibility_matrix
)


def build_assignment_candidates():

    data = build_compatibility_matrix()

    matrix = data["matrix"]
    submissions = data["submissions"]
    reviewers = data["reviewers"]

    candidates = []

    for submission in submissions:

        for reviewer in reviewers:

            score = matrix[
                submission.idea_id
            ][
                reviewer.reviewer_id
            ]

            candidates.append(
                {
                    "submission": submission,
                    "reviewer": reviewer,
                    "score": score
                }
            )

    return candidates


if __name__ == "__main__":

    candidates = (
        build_assignment_candidates()
    )

    print(
        f"Total candidates: {len(candidates)}"
    )

    for candidate in candidates[:10]:

        print(
            candidate["submission"].title,
            "->",
            candidate["reviewer"].name,
            candidate["score"]
        )
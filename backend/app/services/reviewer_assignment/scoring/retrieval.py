from uuid import UUID

from backend.app.services.reviewer_assignment.db.reviewer_repository import (
    get_all_reviewers
)

from backend.app.services.reviewer_assignment.db.submission_repository import (
    get_submission_by_id
)

from backend.app.services.reviewer_assignment.scoring.compatibility import (
    calculate_compatibility
)


def get_top_reviewers_for_submission(
    idea_id: UUID,
    top_k: int = 5,
    reviewers: list | None = None
):

    submission = get_submission_by_id(
        idea_id
    )

    if not submission:
        raise ValueError(
            "Submission not found"
        )

    return get_top_reviewers(
        submission.idea_vector,
        top_k,
        reviewers
    )


def get_top_reviewers(
    idea_vector: dict,
    top_k: int = 5,
    reviewers: list | None = None
):

    if reviewers is None:
        reviewers = get_all_reviewers()

    results = []

    for reviewer in reviewers:

        score = calculate_compatibility(
            reviewer.skill_vector,
            idea_vector
        )

        results.append(
            {
                "reviewer": reviewer,
                "score": score
            }
        )

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results[:top_k]


if __name__ == "__main__":

    from backend.app.services.reviewer_assignment.db.submission_repository import (
        get_all_submissions
    )

    submissions = get_all_submissions()

    for submission in submissions:

        print("\n")
        print("=" * 50)

        print(
            f"TITLE: {submission.title}"
        )

        print(
            f"IDEA ID: {submission.idea_id}"
        )

        print("\nTOP REVIEWERS")

        results = get_top_reviewers(
            submission.idea_vector
        )

        for result in results:

            reviewer = result["reviewer"]

            print(
                reviewer.name,
                result["score"],
                reviewer.primary_specialization
            )
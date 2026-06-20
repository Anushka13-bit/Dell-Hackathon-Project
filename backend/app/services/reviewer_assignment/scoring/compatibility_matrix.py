from app.services.reviewer_assignment.db.submission_repository import (
    get_all_submissions
)

from app.services.reviewer_assignment.db.reviewer_repository import (
    get_all_reviewers
)

from app.services.reviewer_assignment.scoring.compatibility import (
    calculate_compatibility
)


def build_compatibility_matrix():

    submissions = get_all_submissions()
    reviewers = get_all_reviewers()

    matrix = {}

    for submission in submissions:

        matrix[submission.idea_id] = {}

        for reviewer in reviewers:

            score = calculate_compatibility(
                reviewer.skill_vector,
                submission.idea_vector
            )

            matrix[
                submission.idea_id
            ][
                reviewer.reviewer_id
            ] = score

    return {
        "matrix": matrix,
        "submissions": submissions,
        "reviewers": reviewers
    }
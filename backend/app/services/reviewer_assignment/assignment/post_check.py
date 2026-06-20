from backend.app.services.reviewer_assignment.scoring.variance import (
    calculate_variance
)

from backend.app.services.reviewer_assignment.db.reviewer_repository import (
    get_all_reviewers
)

def build_reviewer_counts(assignments):

    counts = {
        reviewer.name: 0
        for reviewer in get_all_reviewers()
    }

    for assignment in assignments:

        reviewer = assignment["reviewer"]

        counts[
            reviewer.name
        ] += 1

    return counts


def validate_assignments(
    assignments,
    threshold=0.10
):

    counts = build_reviewer_counts(
        assignments
    )

    variance = calculate_variance(
        counts
    )

    return {
        "valid":
            variance <= threshold,
        "variance":
            variance,
        "reviewer_counts":
            counts
    }

if __name__ == "__main__":

    from backend.app.services.reviewer_assignment.assignment.global_assignment import (
        solve_assignment
    )

    assignments = solve_assignment()

    result = validate_assignments(
        assignments
    )

    print(result)
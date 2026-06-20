from app.services.reviewer_assignment.assignment.post_check import (
    validate_assignments
)

from app.services.reviewer_assignment.scoring.compatibility_matrix import (
    build_compatibility_matrix
)

from app.services.reviewer_assignment.db.reviewer_repository import (
    get_all_reviewers
)


def rebalance_assignments(
    assignments,
    threshold=1.5, #should change to 0.10
    max_iterations=100
):

    data = build_compatibility_matrix()

    matrix = data["matrix"]

    iteration = 0

    while iteration < max_iterations:

        result = validate_assignments(
            assignments,
            threshold
        )

        if result["valid"]:
            print(
                f"Variance reduced to {result['variance']} "
                f"after {iteration} iterations"
            )
            return assignments

        counts = result[
            "reviewer_counts"
        ]

        overloaded = max(
            counts,
            key=counts.get
        )

        underloaded = min(
            counts,
            key=counts.get
        )

        all_reviewers = (
            get_all_reviewers()
        )

        underloaded_reviewer = None

        for reviewer in all_reviewers:

            if reviewer.name == underloaded:

                underloaded_reviewer = reviewer
                break

        if underloaded_reviewer is None:
            break

        candidate_to_move = None
        smallest_loss = float("inf")

        for assignment in assignments:

            current_reviewer = (
                assignment["reviewer"]
            )

            if (
                current_reviewer.name
                != overloaded
            ):
                continue

            submission = (
                assignment["submission"]
            )

            current_score = matrix[
                submission.idea_id
            ][
                current_reviewer.reviewer_id
            ]

            alternative_score = matrix[
                submission.idea_id
            ][
                underloaded_reviewer.reviewer_id
            ]

            loss = (
                current_score -
                alternative_score
            )

            if loss < smallest_loss:

                smallest_loss = loss

                candidate_to_move = (
                    assignment
                )

        if candidate_to_move is None:

            print(
                "No valid reassignment found"
            )

            break

        candidate_to_move[
            "reviewer"
        ] = underloaded_reviewer

        iteration += 1

    return assignments


if __name__ == "__main__":

    from app.services.reviewer_assignment.assignment.global_assignment import (
        solve_assignment
    )

    assignments = solve_assignment()

    print("\nBEFORE\n")

    for assignment in assignments:

        print(
            assignment["submission"].title,
            "->",
            assignment["reviewer"].name
        )

    assignments = rebalance_assignments(
        assignments
    )

    print("\nAFTER\n")

    for assignment in assignments:

        print(
            assignment["submission"].title,
            "->",
            assignment["reviewer"].name
        )

    print()

    result = validate_assignments(
        assignments
    )

    print(result)
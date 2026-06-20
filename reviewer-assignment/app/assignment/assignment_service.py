from app.assignment.global_assignment import (
    solve_assignment
)

from app.assignment.post_check import (
    validate_assignments
)

from app.assignment.rebalancer import (
    rebalance_assignments
)


def generate_assignments():

    assignments = (
        solve_assignment()
    )

    result = (
        validate_assignments(
            assignments
        )
    )

    print(
        "Initial variance:",
        result["variance"]
    )

    if not result["valid"]:

        assignments = (
            rebalance_assignments(
                assignments
            )
        )

        result = (
            validate_assignments(
                assignments
            )
        )

        print(
            "Post rebalance variance:",
            result["variance"]
        )

    return assignments

if __name__ == "__main__":

    assignments = generate_assignments()

    print()

    for assignment in assignments:

        print(
            assignment["submission"].title,
            "->",
            assignment["reviewer"].name
        )
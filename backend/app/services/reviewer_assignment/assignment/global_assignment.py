import networkx as nx

from backend.app.services.reviewer_assignment.db.load_service import (
    get_all_reviewer_loads
)

from backend.app.services.reviewer_assignment.scoring.compatibility_matrix import (
    build_compatibility_matrix
)


def build_flow_graph():

    data = build_compatibility_matrix()

    matrix = data["matrix"]
    submissions = data["submissions"]
    reviewers = data["reviewers"]

    G = nx.DiGraph()

    source = "source"
    sink = "sink"

    G.add_node(
        source,
        demand=-len(submissions)
    )

    G.add_node(
        sink,
        demand=len(submissions)
    )

    # Submission nodes
    for submission in submissions:

        submission_node = (
            f"submission:{submission.idea_id}"
        )

        G.add_node(
            submission_node,
            demand=0
        )

        G.add_edge(
            source,
            submission_node,
            capacity=1,
            weight=0
        )

    # Reviewer nodes
    loads = get_all_reviewer_loads()

    for reviewer in reviewers:

        reviewer_node = (
            f"reviewer:{reviewer.reviewer_id}"
        )

        G.add_node(
            reviewer_node,
            demand=0
        )

        capacity = max(
            reviewer.max_load -
            loads.get(
                reviewer.reviewer_id,
                0
            ),
            0
        )

        G.add_edge(
            reviewer_node,
            sink,
            capacity=capacity,
            weight=0
        )

    # Compatibility edges
    for submission in submissions:

        submission_node = (
            f"submission:{submission.idea_id}"
        )

        for reviewer in reviewers:

            reviewer_node = (
                f"reviewer:{reviewer.reviewer_id}"
            )

            score = matrix[
                submission.idea_id
            ][
                reviewer.reviewer_id
            ]

            cost = int(
                (1 - score) * 1000
            )

            G.add_edge(
                submission_node,
                reviewer_node,
                capacity=1,
                weight=cost
            )

    return (
        G,
        submissions,
        reviewers,
        matrix
    )

def solve_assignment():

    (
        G,
        submissions,
        reviewers,
        matrix
    ) = build_flow_graph()

    flow = nx.min_cost_flow(
        G
    )

    assignments = []

    for submission in submissions:

        submission_node = (
            f"submission:{submission.idea_id}"
        )

        for reviewer in reviewers:

            reviewer_node = (
                f"reviewer:{reviewer.reviewer_id}"
            )

            if (
                flow[submission_node]
                .get(reviewer_node, 0)
                > 0
            ):

                score = matrix[
                        submission.idea_id
                    ][
                        reviewer.reviewer_id
                    ]

                assignments.append(
                        {
                            "submission": submission,
                            "reviewer": reviewer,
                            "score": score
                        }
                    )

    return assignments



if __name__ == "__main__":

    assignments = (
        solve_assignment()
    )

    print()

    reviewer_counts = {}

    for assignment in assignments:

        reviewer = assignment["reviewer"]

        print(
            assignment["submission"].title,
            "->",
            reviewer.name
        )

        reviewer_counts[
            reviewer.name
        ] = (
            reviewer_counts.get(
                reviewer.name,
                0
            ) + 1
        )

    print()
    print(reviewer_counts)
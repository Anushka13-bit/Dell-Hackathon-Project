import uuid

from backend.app.models import Assignment

from backend.app.services.reviewer_assignment.db.assignment_repository import (
    save_assignments_bulk
)

from backend.app.services.reviewer_assignment.assignment.assignment_service import (
    generate_assignments
)


def persist_assignments():

    generated = (
        generate_assignments()
    )

    db_assignments = []

    for item in generated:

        db_assignments.append(

            Assignment(

                assignment_id=uuid.uuid4(),

                idea_id=item[
                    "submission"
                ].idea_id,

                reviewer_id=item[
                    "reviewer"
                ].reviewer_id,

                compatibility_score=item["score"],

                explanation=[
                    f"Compatibility score: {item['score']}",
                    f"Reviewer specialization: {item['reviewer'].primary_specialization}",
                    "Assigned using Min-Cost Flow optimization"
                ]
            )
        )

    save_assignments_bulk(
        db_assignments
    )

    return db_assignments


if __name__ == "__main__":

    persist_assignments()

    print(
        "Assignments saved"
    )
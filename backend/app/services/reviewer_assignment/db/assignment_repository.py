from backend.app.deps import SessionLocal
from backend.app.models import Assignment


def save_assignment(
    assignment: Assignment
):

    db = SessionLocal()

    try:

        db.add(assignment)

        db.commit()

        db.refresh(
            assignment
        )

        return assignment

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


def assignment_exists(
    idea_id,
    reviewer_id
) -> bool:

    db = SessionLocal()

    try:

        return (
            db.query(
                Assignment
            )
            .filter(
                Assignment.idea_id == idea_id,
                Assignment.reviewer_id == reviewer_id
            )
            .first()
            is not None
        )

    finally:

        db.close()


def get_all_assignments():

    db = SessionLocal()

    try:

        return (
            db.query(
                Assignment
            )
            .all()
        )

    finally:

        db.close()
    
def save_assignments_bulk(
    assignments
):

    db = SessionLocal()

    try:

        db.add_all(
            assignments
        )

        db.commit()

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()

if __name__ == "__main__":

    assignments = get_all_assignments()

    print(
        f"Found {len(assignments)} assignments"
    )

    for assignment in assignments:

        print(
            assignment.idea_id,
            assignment.reviewer_id,
            assignment.compatibility_score
        )
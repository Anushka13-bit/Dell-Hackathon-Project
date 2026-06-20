from uuid import UUID

from backend.app.deps import SessionLocal
from backend.app.models import Reviewer
from backend.app.services.reviewer_assignment.db.load_service import get_reviewer_load


def save_reviewer(
    reviewer: Reviewer
) -> Reviewer:

    db = SessionLocal()

    try:
        db.add(reviewer)
        db.commit()
        db.refresh(reviewer)

        return reviewer

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def get_reviewer_by_id(
    reviewer_id: UUID
) -> Reviewer | None:

    db = SessionLocal()

    try:
        return (
            db.query(Reviewer)
            .filter(
                Reviewer.reviewer_id == reviewer_id
            )
            .first()
        )

    finally:
        db.close()


def get_all_reviewers() -> list[Reviewer]:

    db = SessionLocal()

    try:
        return (
            db.query(Reviewer)
            .all()
        )

    finally:
        db.close()


def delete_reviewer(
    reviewer_id: UUID
) -> bool:

    db = SessionLocal()

    try:

        reviewer = (
            db.query(Reviewer)
            .filter(
                Reviewer.reviewer_id == reviewer_id
            )
            .first()
        )

        if reviewer is None:
            return False

        db.delete(reviewer)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def get_reviewer_capacity(
    reviewer
):

    return (
        reviewer.max_load -
        get_reviewer_load(
            reviewer.reviewer_id
        )
    )

if __name__ == "__main__":

    reviewers = get_all_reviewers()

    for reviewer in reviewers:

        print(
            reviewer.name,
            get_reviewer_load(
                reviewer.reviewer_id
            )
        )
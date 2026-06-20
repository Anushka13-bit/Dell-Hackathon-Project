from app.deps import SessionLocal
from app.models import Assignment
from sqlalchemy import func


def get_reviewer_load(
    reviewer_id
):

    db = SessionLocal()

    try:

        return (
            db.query(Assignment)
            .filter(
                Assignment.reviewer_id == reviewer_id
            )
            .count()
        )

    finally:

        db.close()


def get_all_reviewer_loads():

    db = SessionLocal()

    try:

        results = (
            db.query(
                Assignment.reviewer_id,
                func.count(Assignment.assignment_id)
            )
            .group_by(
                Assignment.reviewer_id
            )
            .all()
        )

        return {
            reviewer_id: load_count
            for reviewer_id, load_count in results
        }

    finally:

        db.close()

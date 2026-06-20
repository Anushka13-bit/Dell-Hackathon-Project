from uuid import UUID

from backend.app.deps import SessionLocal
from backend.app.models import IdeaSubmission


def get_submission_by_id(
    idea_id: UUID
) -> IdeaSubmission | None:

    db = SessionLocal()

    try:
        return (
            db.query(IdeaSubmission)
            .filter(
                IdeaSubmission.idea_id == idea_id
            )
            .first()
        )

    finally:
        db.close()


def get_all_submissions():

    db = SessionLocal()

    try:
        return (
            db.query(IdeaSubmission)
            .all()
        )

    finally:
        db.close()

if __name__ == "__main__":

    submissions = get_all_submissions()

    print(
        f"Found {len(submissions)} submissions"
    )

    for submission in submissions:

        print(
            "ID:",
            submission.idea_id
        )

        print(
            "TITLE:",
            submission.title
        )

        print(
            "VECTOR:",
            submission.idea_vector
        )

        print("-" * 50)
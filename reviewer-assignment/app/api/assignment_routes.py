from fastapi import APIRouter

from app.assignment.persist_assignment import (
    persist_assignments
)

from app.db.assignment_repository import (
    get_all_assignments
)

from app.db.reviewer_repository import (
    get_all_reviewers
)

from app.db.submission_repository import (
    get_all_submissions
)

router = APIRouter(
    prefix="/assignments",
    tags=["Assignments"]
)


@router.post("/generate")
def generate_assignments():

    assignments = persist_assignments()

    return {
        "message": "Assignments generated successfully",
        "count": len(assignments)
    }


@router.get("/")
def fetch_assignments():

    assignments = get_all_assignments()

    return [
        {
            "assignment_id": str(
                assignment.assignment_id
            ),
            "idea_id": str(
                assignment.idea_id
            ),
            "reviewer_id": str(
                assignment.reviewer_id
            ),
            "compatibility_score":
                assignment.compatibility_score,
            "explanation":
                assignment.explanation
        }
        for assignment in assignments
    ]


@router.get("/reviewers")
def fetch_reviewers():

    reviewers = get_all_reviewers()

    return [
        {
            "reviewer_id": str(
                reviewer.reviewer_id
            ),
            "name": reviewer.name,
            "primary_specialization":
                reviewer.primary_specialization,
            "max_load":
                reviewer.max_load
        }
        for reviewer in reviewers
    ]


@router.get("/submissions")
def fetch_submissions():

    submissions = get_all_submissions()

    return [
        {
            "idea_id": str(
                submission.idea_id
            ),
            "title":
                submission.title,
            "status":
                submission.status
        }
        for submission in submissions
    ]

"""
Assignment APIs

Endpoints:

POST /assignments/generate
    Runs the complete reviewer assignment pipeline:
    - Builds compatibility matrix
    - Runs Min-Cost Flow optimization
    - Validates reviewer workload variance
    - Rebalances assignments if required
    - Persists assignments to the database

GET /assignments
    Returns all reviewer assignments.

GET /assignments/reviewers
    Returns all registered reviewers along with
    their primary specialization and capacity.

GET /assignments/submissions
    Returns all submissions available for assignment.
"""
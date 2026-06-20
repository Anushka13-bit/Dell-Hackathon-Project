from app.core.celery_app import celery_app

from app.services.reviewer_assignment.assignment.persist_assignment import (
    persist_assignments
)


@celery_app.task
def reviewer_assignment_task():

    assignments = persist_assignments()

    return {
        "assignments_created": len(assignments)
    }
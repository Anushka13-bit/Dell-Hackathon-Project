from app.tasks.reviewer_tasks import (
    reviewer_assignment_task
)

result = reviewer_assignment_task.delay()

print(
    "Task ID:",
    result.id
)
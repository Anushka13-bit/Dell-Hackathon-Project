from app.tasks.fairness_tasks import (
    fairness_pipeline_task
)

result = fairness_pipeline_task.delay(
    "TEST_ROUND"
)

print(
    "Task ID:",
    result.id
)
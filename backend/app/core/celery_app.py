from celery import Celery

celery_app = Celery(
    "hackos",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)

import app.tasks.reviewer_tasks
import app.tasks.fairness_tasks
from fastapi import APIRouter
from celery.result import AsyncResult

from app.core.celery_app import celery_app

router = APIRouter()


@router.get("/{task_id}")
def get_task_status(task_id: str):

    task = AsyncResult(
        task_id,
        app=celery_app
    )

    return {
        "task_id": task_id,
        "status": task.status,
        "result": (
            task.result
            if task.ready()
            else None
        )
    }
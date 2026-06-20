from app.core.celery_app import (
    celery_app
)

from app.deps import (
    SessionLocal
)

from app.services.fairness_engine.fairness_pipeline import (
    run_fairness_pipeline
)


@celery_app.task
def fairness_pipeline_task(
    round_id
):

    db = SessionLocal()

    try:

        run_fairness_pipeline(
            db,
            round_id
        )

    finally:

        db.close()
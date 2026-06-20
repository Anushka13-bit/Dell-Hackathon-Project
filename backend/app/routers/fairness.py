from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db

from app.tasks.fairness_tasks import (
    fairness_pipeline_task
)

from app.models.bias_alert import (
    BiasAlert
)

from app.models.fairness_report import (
    FairnessReport
)

from app.models.ranking_confidence import (
    RankingConfidence
)

router = APIRouter()


@router.post("/run/{round_id}")
def run_fairness_pipeline(
    round_id: str
):

    task = fairness_pipeline_task.delay(
        round_id
    )

    return {
        "status": "queued",
        "task_id": task.id,
        "round_id": round_id
    }


@router.get("/alerts")
def get_alerts(
    db: Session = Depends(get_db)
):

    return (
        db.query(BiasAlert)
        .all()
    )


@router.get("/report/latest")
def get_latest_report(
    db: Session = Depends(get_db)
):

    return (
        db.query(FairnessReport)
        .order_by(
            FairnessReport.created_at.desc()
        )
        .first()
    )


@router.get("/confidence")
def get_confidence(
    db: Session = Depends(get_db)
):

    return (
        db.query(
            RankingConfidence
        )
        .all()
    )
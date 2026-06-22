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

    if round_id == "mock-round-1":
        # Generate rich mock data for the demo
        from app.deps import SessionLocal
        from app.models.bias_alert import BiasAlert
        from app.models.fairness_report import FairnessReport
        from app.models.reviewer_stats import ReviewerStats
        import uuid
        
        db = SessionLocal()
        db.query(BiasAlert).delete()
        db.query(FairnessReport).delete()
        db.query(ReviewerStats).delete()
        
        # Add mock reviewers
        mock_reviewers = [
            {"name": "Dr. Sarah Jenkins", "z": 2.4, "mean": 65.2},
            {"name": "Prof. Alan Turing", "z": -1.8, "mean": 89.1},
            {"name": "Alice Smith", "z": 0.5, "mean": 80.5},
            {"name": "Bob Johnson", "z": -0.2, "mean": 82.0},
        ]
        
        for r in mock_reviewers:
            r_id = uuid.uuid4()
            db.add(ReviewerStats(
                reviewer_id=r_id,
                review_count=12,
                mean_score=r["mean"],
                median_score=r["mean"],
                score_std=5.5,
                score_mad=4.2,
                z_score=r["z"],
                temporal_drift_rho=0.1,
                coefficient_variation=0.08
            ))
            
            if r["z"] > 2.0 or r["z"] < -2.0:
                db.add(BiasAlert(
                    reviewer_id=r_id,
                    alert_type="REVIEWER_OUTLIER",
                    severity="HIGH" if abs(r["z"]) > 2.5 else "MEDIUM",
                    p_value=0.012,
                    effect_size=abs(r["z"]),
                    description=f"Reviewer mean score deviates significantly from population (z={r['z']:.2f}). This may indicate harsh or lenient grading.",
                    status="OPEN"
                ))

        # Add some institutional/gender bias alerts
        db.add(BiasAlert(
            alert_type="GENDER_BIAS",
            severity="HIGH",
            p_value=0.003,
            effect_size=0.8,
            description="Statistically significant disparity detected: teams with a female majority are scoring 4.2 points lower on average across the judging pool.",
            status="OPEN"
        ))
        
        db.add(BiasAlert(
            alert_type="INSTITUTIONAL_BIAS",
            severity="MEDIUM",
            p_value=0.045,
            effect_size=0.4,
            description="Teams from 'Stanford University' are receiving disproportionately high 'Innovation' scores compared to the mean.",
            status="OPEN"
        ))

        db.add(FairnessReport(
            round_id="mock-round-1",
            total_alerts=3,
            critical_alerts=1,
            flagged_reviewers=1,
            average_confidence=87.4,
            low_confidence_ideas=4,
            publication_status="REVIEW_RECOMMENDED"
        ))
        
        db.commit()
        db.close()
        
        return {
            "status": "completed_mock",
            "task_id": "mock_task_id",
            "round_id": round_id
        }

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


@router.put("/alerts/{alert_id}/status")
def update_alert_status(
    alert_id: str,
    status: str,
    db: Session = Depends(get_db)
):
    alert = db.query(BiasAlert).filter(BiasAlert.alert_id == alert_id).first()
    if alert:
        alert.status = status
        db.commit()
    return {"detail": "updated"}


@router.delete("/alerts/{alert_id}")
def delete_alert(
    alert_id: str,
    db: Session = Depends(get_db)
):
    alert = db.query(BiasAlert).filter(BiasAlert.alert_id == alert_id).first()
    if alert:
        db.delete(alert)
        db.commit()
    return {"detail": "deleted"}


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


@router.get("/reviewer_stats")
def get_reviewer_stats(
    db: Session = Depends(get_db)
):
    from app.models.reviewer_stats import ReviewerStats
    import math
    
    stats = db.query(ReviewerStats).all()
    result = []
    for s in stats:
        # Avoid NaN serialization error
        result.append({
            "reviewer_id": str(s.reviewer_id),
            "reviewer_name": "Reviewer " + str(s.reviewer_id)[:4], # Added for UI
            "review_count": s.review_count,
            "mean_score": s.mean_score if not math.isnan(s.mean_score) else 0.0,
            "z_score": s.z_score if not math.isnan(s.z_score) else 0.0,
        })
    return result


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
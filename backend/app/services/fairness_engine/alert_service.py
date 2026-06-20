from app.models.bias_alert import BiasAlert


def get_open_alerts(db):

    return (
        db.query(BiasAlert)
        .filter(
            BiasAlert.status == "OPEN"
        )
        .order_by(
            BiasAlert.created_at.desc()
        )
        .all()
    )


def acknowledge_alert(
    db,
    alert_id
):

    alert = db.get(
        BiasAlert,
        alert_id
    )

    if alert:

        alert.status = "ACKNOWLEDGED"

        db.commit()

    return alert


def resolve_alert(
    db,
    alert_id
):

    alert = db.get(
        BiasAlert,
        alert_id
    )

    if alert:

        alert.status = "RESOLVED"

        db.commit()

    return alert


def dismiss_alert(
    db,
    alert_id
):

    alert = db.get(
        BiasAlert,
        alert_id
    )

    if alert:

        alert.status = "DISMISSED"

        db.commit()

    return alert
from datetime import datetime
import uuid

from sqlalchemy import String, Text, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class BiasAlert(Base):
    __tablename__ = "bias_alerts"

    alert_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    alert_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    p_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    effect_size: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="OPEN",
        nullable=False
    )

    group_a: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    group_b: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    test_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
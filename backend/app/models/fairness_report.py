from datetime import datetime
import uuid

from sqlalchemy import String, Float, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class FairnessReport(Base):
    __tablename__ = "fairness_reports"

    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    round_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    total_alerts: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    critical_alerts: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    average_confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    low_confidence_ideas: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    flagged_reviewers: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    publication_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
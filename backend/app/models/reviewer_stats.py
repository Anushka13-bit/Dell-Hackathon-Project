from datetime import datetime
import uuid

from sqlalchemy import Float, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ReviewerStats(Base):
    __tablename__ = "reviewer_stats"

    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True
    )

    review_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    mean_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    median_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    score_std: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    score_mad: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    z_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    temporal_drift_rho: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    coefficient_variation: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
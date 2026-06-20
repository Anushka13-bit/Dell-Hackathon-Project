from datetime import datetime
import uuid

from sqlalchemy import String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class RankingConfidence(Base):
    __tablename__ = "ranking_confidence"

    confidence_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    idea_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False
    )

    agreement_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    review_coverage: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    confidence_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    confidence_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
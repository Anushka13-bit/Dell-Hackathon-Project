from datetime import datetime
import uuid

from sqlalchemy import Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class NormalizedScore(Base):
    __tablename__ = "normalized_scores"

    normalized_score_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    evaluation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False
    )

    raw_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    normalized_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    final_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
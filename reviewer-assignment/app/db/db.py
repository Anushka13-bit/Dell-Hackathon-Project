from datetime import datetime
import uuid

from sqlalchemy import (
    String,
    Text,
    Float,
    Integer,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

#reviewer table 

class Reviewer(Base):
    __tablename__ = "reviewers"

    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    resume_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    skills_json: Mapped[dict] = mapped_column(
        JSON,
        nullable=False
    )
    
    skill_vector: Mapped[dict] = mapped_column(
        JSON,
        nullable=False
    )

    primary_specialization: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    secondary_specializations: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list
    )

    # Deprecated: workload should be derived from Assignment records.
    # Retained for backward compatibility only.
    current_load: Mapped[int] = mapped_column(
        default=0,
        nullable=False
    )

    max_load: Mapped[int] = mapped_column(
        Integer,
        default=20,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# ============================================================================
# IDEA SUBMISSIONS
# ============================================================================
# Mirrors the table created by the submission-analysis service
# ============================================================================

class IdeaSubmission(Base):
    __tablename__ = "idea_submissions"

    idea_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True
    )

    team_id: Mapped[uuid.UUID]

    ps_id: Mapped[uuid.UUID]

    title: Mapped[str] = mapped_column(Text)

    description: Mapped[str] = mapped_column(Text)

    # Example:
    # {
    #   "backend": 0.6,
    #   "frontend": 0.1,
    #   "ai_ml": 0.0,
    #   ...
    # }
    idea_vector: Mapped[dict] = mapped_column(
        JSON,
        nullable=False
    )

    submitted_at: Mapped[datetime]

    status: Mapped[str] = mapped_column(
        String(50),
        default="submitted"
    )


# ============================================================================
# ASSIGNMENTS
# ============================================================================
# Source of truth for reviewer allocation
# ============================================================================

class Assignment(Base):
    __tablename__ = "assignments"

    assignment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    idea_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("idea_submissions.idea_id"),
        nullable=False
    )

    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reviewers.reviewer_id"),
        nullable=False
    )

    compatibility_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    # Example:
    # [
    #   "Matched Backend expertise",
    #   "Strong DevOps alignment",
    #   "Load within acceptable range"
    # ]
    explanation: Mapped[list] = mapped_column(
        JSON,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
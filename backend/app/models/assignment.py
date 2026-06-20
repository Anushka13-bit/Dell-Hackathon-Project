from sqlalchemy import Column, Float
from sqlalchemy.dialects.postgresql import UUID, JSON, TIMESTAMP

from .base import Base
from datetime import datetime

class Assignment(Base):
    __tablename__ = "assignments"

    assignment_id = Column(UUID(as_uuid=True), primary_key=True)
    idea_id = Column(UUID(as_uuid=True), nullable=True)
    reviewer_id = Column(UUID(as_uuid=True), nullable=True)
    compatibility_score = Column(Float, nullable=True)
    explanation = Column(JSON, nullable=True)
    created_at = Column(TIMESTAMP,nullable=False,default=datetime.utcnow)

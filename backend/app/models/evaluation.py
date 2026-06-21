from sqlalchemy import Column, Text, Float
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP

from .base import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    evaluation_id = Column(UUID(as_uuid=True), primary_key=True)
    hackathon_id = Column(UUID(as_uuid=True), nullable=True)
    assignment_id = Column(UUID(as_uuid=True), nullable=True)
    reviewer_id = Column(UUID(as_uuid=True), nullable=True)
    idea_id = Column(UUID(as_uuid=True), nullable=True)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, nullable=True)

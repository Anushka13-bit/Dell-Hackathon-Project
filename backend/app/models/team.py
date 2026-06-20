from sqlalchemy import Column, Text, ARRAY, Float
from sqlalchemy.dialects.postgresql import UUID

from .base import Base


class Team(Base):
    __tablename__ = "teams"

    team_id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(Text, nullable=True)
    member_ids = Column(ARRAY(Text), default=[])
    coverage_score = Column(Float, nullable=True)
    diversity_score = Column(Float, nullable=True)
    formation_confidence = Column(Float, nullable=True)

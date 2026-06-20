from sqlalchemy import Column, Text, ARRAY, String, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB

from .base import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Text, primary_key=True)
    name = Column(Text, nullable=True)
    college_name = Column(Text, nullable=True)
    year_of_study = Column(Text, nullable=True)
    github_url = Column(Text, nullable=True)
    linkedin_url = Column(Text, nullable=True)
    declared_skills = Column(ARRAY(String), default=[])
    skill_vector = Column(JSONB, nullable=True)
    team_id = Column(UUID(as_uuid=True), nullable=True)
    vectorization_status = Column(String(50), default='pending')
    duplication_score = Column(Float, nullable=True)

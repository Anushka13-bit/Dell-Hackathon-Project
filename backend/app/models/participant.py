from sqlalchemy import Column, Text, ARRAY, String, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB

from .base import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Text, primary_key=True)
    name = Column(Text, nullable=True)
    college_name = Column(Text, nullable=True)
    github_url = Column(Text, nullable=True)
    declared_skills = Column(ARRAY(String), default=[])
    skill_vector = Column(JSONB, nullable=True)
    team_id = Column(UUID(as_uuid=True), nullable=True)
    gender = Column(Text, nullable=True)
    location = Column(Text, nullable=True)
    degree = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    email = Column(Text, nullable=True)
    status = Column(Text, nullable=True)

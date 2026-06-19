from sqlalchemy import Column, String, Text, ARRAY, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from .base import Base

class Participant(Base):
    __tablename__ = 'participants'
    id = Column(String, primary_key=True, index=True)
    name = Column(Text, nullable=True)
    college_name = Column(Text, nullable=True)
    github_url = Column(Text, nullable=True)
    declared_skills = Column(ARRAY(String), default=[])
    skill_vector = Column(JSON, nullable=True)
    team_id = Column(UUID, ForeignKey('teams.team_id'), nullable=True)

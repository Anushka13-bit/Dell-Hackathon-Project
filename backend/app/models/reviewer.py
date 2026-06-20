from sqlalchemy import Column, Text, Integer, VARCHAR
from sqlalchemy.dialects.postgresql import UUID, JSON, TIMESTAMP

from .base import Base


class Reviewer(Base):
    __tablename__ = "reviewers"

    reviewer_id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(VARCHAR(255), nullable=False)
    resume_text = Column(Text, nullable=True)
    skills_json = Column(JSON, nullable=True)
    skill_vector = Column(JSON, nullable=True)
    primary_specialization = Column(VARCHAR(100), nullable=True)
    max_load = Column(Integer,default=5,nullable=False)
    secondary_specializations = Column(JSON, nullable=True)
    current_load = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, nullable=True)
    

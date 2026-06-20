from sqlalchemy import Column, Text, VARCHAR, Integer
from sqlalchemy.dialects.postgresql import UUID, JSON, TIMESTAMP

from .base import Base


class IdeaSubmission(Base):
    __tablename__ = "idea_submissions"

    idea_id = Column(UUID(as_uuid=True), primary_key=True)
    team_id = Column(UUID(as_uuid=True), nullable=True)
    ps_id = Column(UUID(as_uuid=True), nullable=True)
    title = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    idea_vector = Column(JSON, nullable=True)
    
    # New Fields for submissions
    github_url = Column(Text, nullable=True)
    ppt_url = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    
    submitted_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)
    status = Column(VARCHAR(50), nullable=True)

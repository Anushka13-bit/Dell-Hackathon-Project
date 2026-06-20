import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from .base import Base

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hackathon_id = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(384))
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc))

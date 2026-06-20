from sqlalchemy import Column, String, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB, TIMESTAMP
import uuid
from datetime import datetime, timezone
from .base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(100), nullable=False)
    payload = Column(JSONB, nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=True) # Optional, can be system
    prev_hash = Column(String(64), nullable=False) # SHA-256
    curr_hash = Column(String(64), nullable=False, unique=True)
    created_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))

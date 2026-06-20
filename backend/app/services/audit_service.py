import hashlib
import json
from sqlalchemy.orm import Session
from ..models.audit import AuditLog

GENESIS_HASH = "0" * 64

def _compute_hash(prev_hash: str, payload: dict) -> str:
    payload_str = json.dumps(payload, sort_keys=True)
    data = f"{prev_hash}{payload_str}".encode('utf-8')
    return hashlib.sha256(data).hexdigest()

def log_event(db: Session, event_type: str, payload: dict, user_id: str = None) -> AuditLog:
    """Logs a state-changing event with a cryptographic hash chain."""
    last_log = db.query(AuditLog).order_by(AuditLog.created_at.desc()).first()
    prev_hash = last_log.curr_hash if last_log else GENESIS_HASH
    
    curr_hash = _compute_hash(prev_hash, payload)
    
    new_log = AuditLog(
        event_type=event_type,
        payload=payload,
        user_id=user_id,
        prev_hash=prev_hash,
        curr_hash=curr_hash
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

def verify_chain(db: Session) -> dict:
    """Verifies the integrity of the audit hash chain."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.asc()).all()
    if not logs:
        return {"valid": True, "message": "No logs to verify.", "broken_at_id": None}
        
    expected_prev = GENESIS_HASH
    for log in logs:
        if log.prev_hash != expected_prev:
            return {"valid": False, "message": "Chain broken: prev_hash mismatch", "broken_at_id": str(log.id)}
            
        expected_curr = _compute_hash(log.prev_hash, log.payload)
        if log.curr_hash != expected_curr:
            return {"valid": False, "message": "Chain broken: curr_hash mismatch (payload tampered)", "broken_at_id": str(log.id)}
            
        expected_prev = log.curr_hash
        
    return {"valid": True, "message": "Chain is fully intact.", "broken_at_id": None}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..deps import get_db
from ..services.audit_service import verify_chain

router = APIRouter()

@router.get("/verify")
def verify_audit_trail(db: Session = Depends(get_db)):
    """Organizer endpoint to verify the integrity of the audit hash chain."""
    # In a real app, check if user is organizer via RBAC here
    result = verify_chain(db)
    if not result["valid"]:
        raise HTTPException(status_code=409, detail=result)
    return result

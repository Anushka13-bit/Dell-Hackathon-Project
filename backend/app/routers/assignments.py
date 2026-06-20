from fastapi import APIRouter
router = APIRouter()
@router.get("/")
async def get_dummy():
    return {"status": "not implemented"}

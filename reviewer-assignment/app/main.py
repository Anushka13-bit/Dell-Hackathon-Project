from fastapi import FastAPI

from app.api.assignment_routes import (
    router as assignment_router
)

from app.api.reviewer_routes import (
    router as reviewer_router
)

app = FastAPI(
    title="Reviewer Assignment Service"
)

app.include_router(
    assignment_router
)

app.include_router(
    reviewer_router
)


@app.get("/")
def health_check():

    return {
        "status": "healthy",
        "service":
            "reviewer-assignment"
    }
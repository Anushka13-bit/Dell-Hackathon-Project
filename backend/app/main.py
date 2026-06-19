from fastapi import FastAPI
from .deps import init_db
from .routers import participants, reviewers, hackathons, teams, submissions, assignments, evaluations, leaderboard

app = FastAPI(title="Hackathon Backend", version="0.1.0")

# Include routers
app.include_router(participants.router, prefix="/participants", tags=["participants"])
app.include_router(reviewers.router, prefix="/reviewers", tags=["reviewers"])
app.include_router(hackathons.router, prefix="/hackathons", tags=["hackathons"])
app.include_router(teams.router, prefix="/teams", tags=["teams"])
app.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
app.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
app.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])

# Startup event – ensure DB tables exist (idempotent)
@app.on_event("startup")
async def startup():
    init_db()

# Root health check
@app.get("/health")
async def health_check():
    return {"status": "ok"}

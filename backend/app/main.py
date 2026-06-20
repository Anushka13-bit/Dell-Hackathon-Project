from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import participants, reviewers, hackathons, teams, submissions, assignments, evaluations, leaderboard

app = FastAPI(title="Hackathon Backend", version="0.1.0")

# Add CORS middleware to allow the Next.js frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins in dev, restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(participants.router, prefix="/participants", tags=["participants"])
app.include_router(reviewers.router, prefix="/reviewers", tags=["reviewers"])
app.include_router(hackathons.router, prefix="/hackathons", tags=["hackathons"])
app.include_router(teams.router, prefix="/teams", tags=["teams"])
app.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
app.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
app.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])

# Startup event
@app.on_event("startup")
async def startup():
    # Preload the sentence-transformers model so the first request doesn't hang
    try:
        from participant_ai.core.embeddings import _get_model
        _get_model()
    except ImportError:
        pass

# Root health check
@app.get("/health")
async def health_check():
    return {"status": "ok"}

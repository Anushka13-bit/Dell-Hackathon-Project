from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .routers import participants, reviewers, hackathons, teams, submissions, assignments, evaluations, leaderboard, problem_statements, organizer
from .core.config import settings
from .core.exceptions import setup_exception_handlers
from .core.logging import logger

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])
app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Set up centralized exception handlers
setup_exception_handlers(app)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
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
app.include_router(problem_statements.router, prefix="/problem-statements", tags=["problem_statements"])
app.include_router(organizer.router, prefix="/organizer", tags=["organizer"])

# Startup event
@app.on_event("startup")
async def startup():
    from .deps import init_missing_tables
    init_missing_tables()
    
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

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.limiter import limiter
from app.routes.surveys import router as survey_router
from app.routes.responses import router as response_router
from app.routes.analytics import router as analytics_router
from app.routes.auth import router as auth_router


app = FastAPI(
    title="Dynamic Survey Platform API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rate limiting ─────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.include_router(auth_router)
app.include_router(survey_router)
app.include_router(response_router)
app.include_router(analytics_router)


@app.get("/")
async def root():
    return {
        "message": "Survey Platform API"
    }


@app.get("/api/health")
async def health():
    return {
        "success": True,
        "message": "API is running"
    }
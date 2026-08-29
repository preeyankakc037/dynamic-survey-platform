from fastapi import FastAPI

from app.routes.surveys import router as survey_router


app = FastAPI(
    title="Dynamic Survey Platform API",
    version="1.0.0",
)


app.include_router(survey_router)


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
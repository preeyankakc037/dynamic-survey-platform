from fastapi import FastAPI

app = FastAPI(
    title="Dynamic Survey Platform API",
    version="1.0.0"
)


@app.get("/api/health")
async def health_check():
    return {
        "success": True,
        "message": "Survey API is running"
    }
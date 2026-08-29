from fastapi import APIRouter, Request, status

from app.limiter import limiter
from app.schemas.response import ResponseCreate
from app.services.response_service import create_response


router = APIRouter(
    prefix="/api/surveys",
    tags=["Responses"]
)


@router.post("/{survey_id}/responses", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def submit_response_endpoint(request: Request, survey_id: str, response: ResponseCreate):
    return await create_response(survey_id, response)

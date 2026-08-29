from fastapi import APIRouter, status

from app.schemas.response import ResponseCreate
from app.services.response_service import create_response


router = APIRouter(
    prefix="/api/surveys",
    tags=["Responses"]
)


@router.post("/{survey_id}/responses", status_code=status.HTTP_201_CREATED)
async def submit_response_endpoint(survey_id: str, response: ResponseCreate):
    return await create_response(survey_id, response)

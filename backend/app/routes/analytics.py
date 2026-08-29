from fastapi import APIRouter

from app.services.analytics_service import get_survey_analytics


router = APIRouter(
    prefix="/api/surveys",
    tags=["Analytics"]
)


@router.get("/{survey_id}/analytics")
async def get_survey_analytics_endpoint(survey_id: str):
    return await get_survey_analytics(survey_id)

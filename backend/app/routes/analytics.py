from fastapi import APIRouter, Depends

from app.services.analytics_service import get_survey_analytics
from app.services.auth_service import get_current_admin


router = APIRouter(
    prefix="/api/surveys",
    tags=["Analytics"]
)


@router.get("/{survey_id}/analytics")
async def get_survey_analytics_endpoint(survey_id: str, admin: str = Depends(get_current_admin)):
    return await get_survey_analytics(survey_id)

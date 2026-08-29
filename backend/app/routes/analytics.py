from fastapi import APIRouter, Depends

from app.services.analytics_service import get_survey_analytics, get_global_analytics
from app.services.auth_service import get_current_admin

router = APIRouter(
    prefix="/api",
    tags=["Analytics"]
)

@router.get("/surveys/{survey_id}/analytics")
async def get_survey_analytics_endpoint(survey_id: str, admin: str = Depends(get_current_admin)):
    return await get_survey_analytics(survey_id)

@router.get("/analytics/summary")
async def get_global_analytics_endpoint(admin: str = Depends(get_current_admin)):
    return await get_global_analytics()

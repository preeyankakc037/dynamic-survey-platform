from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.survey import SurveyCreate
from app.services.auth_service import get_current_admin
from app.services.survey_service import (
    create_survey,
    get_surveys,
    get_survey_by_id,
    update_survey,
    delete_survey,
)


router = APIRouter(
    prefix="/api/surveys",
    tags=["Surveys"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_survey_endpoint(survey: SurveyCreate, admin: str = Depends(get_current_admin)):
    return await create_survey(survey)


@router.get("/")
async def list_surveys_endpoint():
    return await get_surveys()


@router.get("/{survey_id}")
async def get_survey_endpoint(survey_id: str):
    survey = await get_survey_by_id(survey_id)

    if survey is None:
        raise HTTPException(status_code=404, detail="Survey not found")

    return survey


@router.put("/{survey_id}")
async def update_survey_endpoint(survey_id: str, survey: SurveyCreate, admin: str = Depends(get_current_admin)):
    updated_survey = await update_survey(survey_id, survey)

    if updated_survey is None:
        raise HTTPException(status_code=404, detail="Survey not found")

    return updated_survey


@router.delete("/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_survey_endpoint(survey_id: str, admin: str = Depends(get_current_admin)):
    deleted = await delete_survey(survey_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Survey not found")

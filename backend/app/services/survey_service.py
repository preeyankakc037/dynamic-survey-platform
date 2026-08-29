from datetime import datetime, timezone

from bson import ObjectId
from pymongo import ReturnDocument

from app.config.database import surveys_collection
from app.schemas.survey import SurveyCreate


async def create_survey(survey: SurveyCreate):
    survey_data = survey.model_dump()

    now = datetime.now(timezone.utc)

    survey_data["created_at"] = now
    survey_data["updated_at"] = now

    result = await surveys_collection.insert_one(survey_data)

    created_survey = await surveys_collection.find_one(
        {"_id": result.inserted_id}
    )

    created_survey["_id"] = str(created_survey["_id"])

    return created_survey

async def get_surveys():
    cursor = surveys_collection.find().sort("created_at", -1)

    surveys = []

    async for survey in cursor:
        survey["_id"] = str(survey["_id"])
        surveys.append(survey)

    return surveys

async def get_survey_by_id(survey_id: str):
    if not ObjectId.is_valid(survey_id):
        return None

    survey = await surveys_collection.find_one({"_id": ObjectId(survey_id)})

    if survey is None:
        return None

    survey["_id"] = str(survey["_id"])
    return survey

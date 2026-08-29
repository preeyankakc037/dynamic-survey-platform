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

async def update_survey(survey_id: str, survey: SurveyCreate):
    if not ObjectId.is_valid(survey_id):
        return None

    survey_data = survey.model_dump()
    survey_data["updated_at"] = datetime.now(timezone.utc)

    updated_survey = await surveys_collection.find_one_and_update(
        {"_id": ObjectId(survey_id)},
        {"$set": survey_data},
        return_document=ReturnDocument.AFTER,
    )

    if updated_survey is None:
        return None

    updated_survey["_id"] = str(updated_survey["_id"])
    return updated_survey

async def delete_survey(survey_id: str):
    if not ObjectId.is_valid(survey_id):
        return False

    result = await surveys_collection.delete_one({"_id": ObjectId(survey_id)})
    return result.deleted_count == 1

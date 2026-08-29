from datetime import datetime, timezone

from fastapi import HTTPException

from app.config.database import responses_collection
from app.schemas.response import ResponseCreate
from app.services.survey_service import get_survey_by_id


def _is_condition_met(condition, answers_by_id):
    if condition is None:
        return True
    cond_value = condition.get("value")
    # If condition value is empty/None, treat as "always show"
    if cond_value is None or cond_value == "":
        return True
    actual = answers_by_id.get(condition["question_id"])
    # Type-safe comparison: compare as strings to handle int/str mismatch
    return str(actual) == str(cond_value)


def _validate_answer(question, value):
    q_type = question["type"]

    if q_type == "text":
        if not isinstance(value, str):
            raise HTTPException(400, f"Question '{question['label']}' expects text")

    elif q_type == "single_choice":
        options = question.get("options") or []
        if not isinstance(value, str) or value not in options:
            raise HTTPException(400, f"Question '{question['label']}' expects one of {options}")

    elif q_type == "checkbox":
        options = question.get("options") or []
        if not isinstance(value, list) or not all(v in options for v in value):
            raise HTTPException(400, f"Question '{question['label']}' expects a subset of {options}")

    elif q_type == "rating":
        min_val = question.get("min") or 1
        max_val = question.get("max") or 5
        if not isinstance(value, int) or not (min_val <= value <= max_val):
            raise HTTPException(400, f"Question '{question['label']}' expects rating between {min_val} and {max_val}")


async def create_response(survey_id: str, response: ResponseCreate):
    survey = await get_survey_by_id(survey_id)

    if survey is None:
        raise HTTPException(404, "Survey not found")

    answers_by_id = {answer.question_id: answer.value for answer in response.answers}

    for question in survey["questions"]:
        visible = _is_condition_met(question.get("condition"), answers_by_id)
        value = answers_by_id.get(question["id"])

        if not visible:
            continue

        empty = value is None or value == "" or value == []

        if question.get("required") and empty:
            raise HTTPException(400, f"Question '{question['label']}' is required")

        if not empty:
            _validate_answer(question, value)

    response_data = {
        "survey_id": survey_id,
        "answers": [answer.model_dump() for answer in response.answers],
        "submitted_at": datetime.now(timezone.utc),
    }

    result = await responses_collection.insert_one(response_data)
    response_data["_id"] = str(result.inserted_id)

    return response_data


async def get_responses(survey_id: str):
    responses = []
    async for response in responses_collection.find(
        {"survey_id": survey_id},
        sort=[("submitted_at", -1)]
    ):
        response["_id"] = str(response["_id"])
        # Convert datetime to ISO string
        if "submitted_at" in response and hasattr(response["submitted_at"], "isoformat"):
            response["submitted_at"] = response["submitted_at"].isoformat()
        responses.append(response)
    return responses

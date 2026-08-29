from fastapi import HTTPException

from app.config.database import responses_collection
from app.services.survey_service import get_survey_by_id


async def get_survey_analytics(survey_id: str):
    survey = await get_survey_by_id(survey_id)

    if survey is None:
        raise HTTPException(404, "Survey not found")

    responses = []
    async for response in responses_collection.find({"survey_id": survey_id}):
        responses.append(response)

    total_responses = len(responses)
    question_results = []

    for question in survey["questions"]:
        q_id = question["id"]
        q_type = question["type"]

        values = []
        for response in responses:
            for answer in response["answers"]:
                if answer["question_id"] == q_id and answer["value"] not in (None, "", []):
                    values.append(answer["value"])

        result = {
            "id": q_id,
            "label": question["label"],
            "type": q_type,
        }

        if q_type in ("single_choice", "checkbox"):
            counts = {}
            for value in values:
                choices = value if isinstance(value, list) else [value]
                for choice in choices:
                    counts[choice] = counts.get(choice, 0) + 1
            result["counts"] = counts

        elif q_type == "rating":
            result["average"] = round(sum(values) / len(values), 2) if values else None
            result["count"] = len(values)

        elif q_type == "text":
            result["answers"] = values

        question_results.append(result)

    return {
        "survey_id": survey_id,
        "title": survey["title"],
        "total_responses": total_responses,
        "questions": question_results,
    }

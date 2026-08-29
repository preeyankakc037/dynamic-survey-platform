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
                    counts[str(choice)] = counts.get(str(choice), 0) + 1
            result["counts"] = counts

        elif q_type == "rating":
            numeric_values = []
            for v in values:
                if v is not None:
                    try:
                        numeric_values.append(float(v))
                    except (ValueError, TypeError):
                        pass
            
            result["average"] = round(sum(numeric_values) / len(numeric_values), 2) if numeric_values else None
            result["count"] = len(numeric_values)
            # Build distribution counts for chart
            dist_counts = {}
            for v in numeric_values:
                key = str(int(v))
                dist_counts[key] = dist_counts.get(key, 0) + 1
            result["counts"] = dist_counts

        elif q_type == "text":
            result["answers"] = [str(v) for v in values]

        question_results.append(result)

    return {
        "survey_id": survey_id,
        "title": survey["title"],
        "total_responses": total_responses,
        "questions": question_results,
    }

async def get_global_analytics():
    total = await responses_collection.count_documents({})
    return {"total_responses": total}

from typing import Literal

from pydantic import BaseModel, Field


QuestionType = Literal[
    "text",
    "single_choice",
    "checkbox",
    "rating",
]


class Condition(BaseModel):
    question_id: str
    operator: Literal["equals"]
    value: str | int


class Question(BaseModel):
    id: str
    type: QuestionType
    label: str = Field(min_length=1)
    required: bool = False

    # Used by single_choice and checkbox
    options: list[str] | None = None

    # Used by rating
    min: int | None = None
    max: int | None = None

    # Optional conditional visibility
    condition: Condition | None = None


class SurveyCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    questions: list[Question] = Field(default_factory=list)
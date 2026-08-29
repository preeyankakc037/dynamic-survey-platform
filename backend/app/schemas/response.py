from pydantic import BaseModel


class Answer(BaseModel):
    question_id: str
    value: str | int | list[str] | None = None


class ResponseCreate(BaseModel):
    answers: list[Answer]

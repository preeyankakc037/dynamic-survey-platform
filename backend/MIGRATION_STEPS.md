# Migration Steps — apply to old repo, one commit per step

Target repo layout (final state, after all steps):

```
<repo-root>/
├── .env                  (gitignored — create locally, do NOT commit)
├── .gitignore
├── main.py
├── requirements.txt
├── venv/                 (gitignored)
└── app/
    ├── config/
    │   └── database.py
    ├── limiter.py
    ├── routes/
    │   ├── auth.py
    │   ├── surveys.py
    │   ├── responses.py
    │   └── analytics.py
    ├── schemas/
    │   ├── auth.py
    │   ├── survey.py
    │   └── response.py
    └── services/
        ├── auth_service.py
        ├── survey_service.py
        ├── response_service.py
        └── analytics_service.py
```

No `models/` folder in the final state — it was dead code (unused imports, no real model), delete it if present.

Rules for the agent applying this:
- Do exactly one step, run its test command, confirm it passes, THEN commit with the given message, THEN move to next step.
- Never combine steps into one commit.
- If a file already has different content than the "before" shown, treat this as a rewrite: replace it fully with the "after" content shown for that step (don't try to hand-merge).
- Run all commands from repo root unless stated otherwise.

---

## Step 0 — Project structure (venv, .env/.gitignore/requirements/main.py at root)

**Goal:** entrypoint and config live at repo root; `app/` is just the importable package.

1. If `app/main.py` exists inside the package folder, move it to repo root as `main.py`. Its imports (`from app.routes...`) don't change — they already assume repo root as the run directory.
2. Create `requirements.txt` at repo root:

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
pymongo==4.16.0
python-dotenv==1.0.1
pydantic==2.9.2
```

3. Create `.env` at repo root (NOT inside `app/`):

```
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=dynamic-survey-platform
```

4. Create `.gitignore` at repo root:

```
venv/
__pycache__/
*.pyc
.env
```

5. Create the virtual environment and install deps:

```
python -m venv venv
venv\Scripts\python.exe -m pip install --upgrade pip
venv\Scripts\python.exe -m pip install -r requirements.txt
```

6. Delete `app/models/` folder entirely if it exists — confirm nothing imports `app.models` first:

```
grep -rn "from app.models" . --include=*.py
```

If no hits, delete the folder.

**Test:**
```
venv\Scripts\python.exe -m uvicorn main:app --reload
```
Visit `http://127.0.0.1:8000/api/health` → expect `{"success":true,"message":"API is running"}`.

**Commit:** `chore: restructure project — entrypoint, env, venv at repo root`

---

## Step 1 — Survey CRUD: create, list, get-by-id

**File: `app/services/survey_service.py`** (full content)
```python
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
```

**File: `app/routes/surveys.py`** (full content — this fixes a bug where the old list endpoint called itself recursively instead of calling the service function)
```python
from fastapi import APIRouter, HTTPException, status

from app.schemas.survey import SurveyCreate
from app.services.survey_service import create_survey, get_surveys, get_survey_by_id


router = APIRouter(
    prefix="/api/surveys",
    tags=["Surveys"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_survey_endpoint(survey: SurveyCreate):
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
```

**File: `main.py`** — ensure it includes the survey router:
```python
from fastapi import FastAPI

from app.routes.surveys import router as survey_router


app = FastAPI(
    title="Dynamic Survey Platform API",
    version="1.0.0",
)


app.include_router(survey_router)


@app.get("/")
async def root():
    return {
        "message": "Survey Platform API"
    }


@app.get("/api/health")
async def health():
    return {
        "success": True,
        "message": "API is running"
    }
```

(`app/schemas/survey.py` already defines `SurveyCreate`/`Question`/`Condition` — leave as is if present; if missing, see Appendix A below.)

**Test:**
```
curl -X POST http://127.0.0.1:8000/api/surveys/ -H "Content-Type: application/json" -d "{\"title\":\"Test\",\"description\":\"demo\",\"questions\":[{\"id\":\"q1\",\"type\":\"text\",\"label\":\"Name\",\"required\":true}]}"
curl http://127.0.0.1:8000/api/surveys/
curl http://127.0.0.1:8000/api/surveys/<id-from-above>
```
Expect 201 on create, list shows the survey, get-by-id returns it; a bad id returns 404.

**Commit:** `feat: survey create/list/get-by-id endpoints`

---

## Step 2 — Survey update + delete

**File: `app/services/survey_service.py`** — append these two functions (keep everything from Step 1):
```python
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
```

**File: `app/routes/surveys.py`** (full content, replaces Step 1 version)
```python
from fastapi import APIRouter, HTTPException, status

from app.schemas.survey import SurveyCreate
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
async def create_survey_endpoint(survey: SurveyCreate):
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
async def update_survey_endpoint(survey_id: str, survey: SurveyCreate):
    updated_survey = await update_survey(survey_id, survey)

    if updated_survey is None:
        raise HTTPException(status_code=404, detail="Survey not found")

    return updated_survey


@router.delete("/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_survey_endpoint(survey_id: str):
    deleted = await delete_survey(survey_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Survey not found")
```

**Test:**
```
curl -X PUT http://127.0.0.1:8000/api/surveys/<id> -H "Content-Type: application/json" -d "{\"title\":\"Updated\",\"description\":\"\",\"questions\":[]}"
curl -X DELETE http://127.0.0.1:8000/api/surveys/<id>
curl http://127.0.0.1:8000/api/surveys/
```
Expect 200 on update, 204 on delete, deleted survey gone from list.

**Commit:** `feat: survey update and delete endpoints`

---

## Step 3 — Response submission (public, conditional-logic aware)

**File: `app/schemas/response.py`** (new file, full content)
```python
from pydantic import BaseModel


class Answer(BaseModel):
    question_id: str
    value: str | int | list[str] | None = None


class ResponseCreate(BaseModel):
    answers: list[Answer]
```

**File: `app/services/response_service.py`** (new file, full content)
```python
from datetime import datetime, timezone

from fastapi import HTTPException

from app.config.database import responses_collection
from app.schemas.response import ResponseCreate
from app.services.survey_service import get_survey_by_id


def _is_condition_met(condition, answers_by_id):
    if condition is None:
        return True
    return answers_by_id.get(condition["question_id"]) == condition["value"]


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
```

**File: `app/routes/responses.py`** (new file, full content)
```python
from fastapi import APIRouter, status

from app.schemas.response import ResponseCreate
from app.services.response_service import create_response


router = APIRouter(
    prefix="/api/surveys",
    tags=["Responses"]
)


@router.post("/{survey_id}/responses", status_code=status.HTTP_201_CREATED)
async def submit_response_endpoint(survey_id: str, response: ResponseCreate):
    return await create_response(survey_id, response)
```

**File: `main.py`** — add the import and include call:
```python
from app.routes.responses import router as response_router
...
app.include_router(response_router)
```

**Test:** create a survey with a conditional question (q2 shown only if q1 == "Yes"):
```json
{
  "title": "Feedback", "description": "demo",
  "questions": [
    {"id": "q1", "type": "single_choice", "label": "Do you like pizza?", "required": true, "options": ["Yes", "No"]},
    {"id": "q2", "type": "text", "label": "Why?", "required": true, "condition": {"question_id": "q1", "operator": "equals", "value": "Yes"}},
    {"id": "q3", "type": "rating", "label": "Rate us", "required": true, "min": 1, "max": 5}
  ]
}
```
- Submit `q1=No, q3=4` (q2 omitted) → expect **201** (condition not met, q2 not required)
- Submit `q1=Yes, q3=4` (q2 omitted) → expect **400** (`Question 'Why?' is required`)
- Submit `q1=Yes, q2=cheese, q3=9` → expect **400** (rating out of range)
- Submit `q1=Yes, q2=cheese, q3=5` → expect **201**

**Commit:** `feat: public response submission with conditional-logic validation`

---

## Step 4 — Analytics dashboard

**File: `app/services/analytics_service.py`** (new file, full content)
```python
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
```

**File: `app/routes/analytics.py`** (new file, full content)
```python
from fastapi import APIRouter

from app.services.analytics_service import get_survey_analytics


router = APIRouter(
    prefix="/api/surveys",
    tags=["Analytics"]
)


@router.get("/{survey_id}/analytics")
async def get_survey_analytics_endpoint(survey_id: str):
    return await get_survey_analytics(survey_id)
```

**File: `main.py`** — add the import and include call:
```python
from app.routes.analytics import router as analytics_router
...
app.include_router(analytics_router)
```

**Test:**
```
curl http://127.0.0.1:8000/api/surveys/<id>/analytics
```
Expect `total_responses` count, and per question: `counts` for single_choice/checkbox, `average`+`count` for rating, `answers` list for text.

**Commit:** `feat: analytics dashboard endpoint`

---

## Step 5 — JWT auth for admin routes

**Install dependency:**
```
venv\Scripts\python.exe -m pip install PyJWT==2.9.0
```
Add to `requirements.txt`:
```
PyJWT==2.9.0
```

**Add to `.env`** (generate your own secret, don't reuse an example — run `python -c "import secrets;print(secrets.token_hex(32))"` and paste the output):
```
JWT_SECRET_KEY=<paste-your-generated-secret-here>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

ADMIN_USERNAME=admin
ADMIN_PASSWORD=<pick-your-own-password>
```

**File: `app/schemas/auth.py`** (new file, full content)
```python
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

**File: `app/services/auth_service.py`** (new file, full content)
```python
import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

security = HTTPBearer()


def authenticate_admin(username: str, password: str) -> bool:
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD


def create_access_token(username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    return payload["sub"]
```

**File: `app/routes/auth.py`** (new file, full content)
```python
from fastapi import APIRouter, HTTPException

from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import authenticate_admin, create_access_token


router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"]
)


@router.post("/login", response_model=TokenResponse)
async def login_endpoint(credentials: LoginRequest):
    if not authenticate_admin(credentials.username, credentials.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(credentials.username)
    return TokenResponse(access_token=token)
```

**File: `app/routes/surveys.py`** — protect create/update/delete only (list/get stay public). Full content:
```python
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
```

**File: `app/routes/analytics.py`** — protect it (admin-only dashboard). Full content:
```python
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
```

**File: `main.py`** — add auth router import/include:
```python
from app.routes.auth import router as auth_router
...
app.include_router(auth_router)
```

**Test:**
```
curl -X POST http://127.0.0.1:8000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"<your-password>\"}"
```
Copy `access_token` from response.
```
curl -X POST http://127.0.0.1:8000/api/surveys/ -H "Content-Type: application/json" -d "{\"title\":\"x\",\"description\":\"\",\"questions\":[]}"
```
Expect **403** "Not authenticated" (no token).
```
curl -X POST http://127.0.0.1:8000/api/surveys/ -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d "{\"title\":\"x\",\"description\":\"\",\"questions\":[]}"
```
Expect **201**. And `GET /api/surveys/` (no token) still works — public.

**Commit:** `feat: JWT auth protecting admin survey write and analytics routes`

---

## Step 6 — Rate limiting on public response submission

**Install dependency:**
```
venv\Scripts\python.exe -m pip install slowapi==0.1.9
```
Add to `requirements.txt`:
```
slowapi==0.1.9
```

**File: `app/limiter.py`** (new file, full content)
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
```

**File: `app/routes/responses.py`** (full content, replaces Step 3 version)
```python
from fastapi import APIRouter, Request, status

from app.limiter import limiter
from app.schemas.response import ResponseCreate
from app.services.response_service import create_response


router = APIRouter(
    prefix="/api/surveys",
    tags=["Responses"]
)


@router.post("/{survey_id}/responses", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def submit_response_endpoint(request: Request, survey_id: str, response: ResponseCreate):
    return await create_response(survey_id, response)
```

**File: `main.py`** (full content — final state, all routers + limiter wired)
```python
from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.limiter import limiter
from app.routes.surveys import router as survey_router
from app.routes.responses import router as response_router
from app.routes.analytics import router as analytics_router
from app.routes.auth import router as auth_router


app = FastAPI(
    title="Dynamic Survey Platform API",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.include_router(auth_router)
app.include_router(survey_router)
app.include_router(response_router)
app.include_router(analytics_router)


@app.get("/")
async def root():
    return {
        "message": "Survey Platform API"
    }


@app.get("/api/health")
async def health():
    return {
        "success": True,
        "message": "API is running"
    }
```

**Test:** fire 6 quick POSTs to the same survey's `/responses` endpoint. First 5 → 201, 6th → **429** with `{"error":"Rate limit exceeded: 5 per 1 minute"}`.

**Commit:** `feat: rate limit public response submission (5/min per IP)`

---

## Appendix A — `app/schemas/survey.py` (only needed if this file is missing/empty in the old repo)

```python
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
```

## Appendix B — `app/config/database.py` (only needed if missing/broken in the old repo)

```python
import os

from dotenv import load_dotenv
from pymongo import AsyncMongoClient


load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "dynamic-survey-platform")


client = AsyncMongoClient(MONGODB_URI)

db = client[DATABASE_NAME]

surveys_collection = db["surveys"]
responses_collection = db["responses"]
```

Requires a MongoDB instance reachable at `MONGODB_URI` (local `mongod` running on default port 27017, or an Atlas connection string).

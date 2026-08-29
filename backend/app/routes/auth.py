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

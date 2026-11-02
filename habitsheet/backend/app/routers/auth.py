from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.schemas.auth import UserCreate, UserLogin, UserUpdate, UserResponse, TokenResponse, GoogleLoginRequest
from app.models.user import user_helper
import httpx

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/demo", response_model=TokenResponse)
async def demo_login(response: Response, db: AsyncIOMotorDatabase = Depends(get_database)):
    demo_email = "demo@habitsheet.app"
    user = await db["users"].find_one({"email": demo_email})
    now = datetime.utcnow()
    
    if not user:
        user_doc = {
            "name": "Demo Planner",
            "email": demo_email,
            "hashed_password": get_password_hash("demo12345"),
            "timezone": "Asia/Kolkata",
            "theme": "light",
            "created_at": now,
            "updated_at": now
        }
        res = await db["users"].insert_one(user_doc)
        user_doc["_id"] = res.inserted_id
        user_data = user_helper(user_doc)
    else:
        user_data = user_helper(user)

    access_token = create_access_token(user_data["id"])
    refresh_token = create_refresh_token(user_data["id"])

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        samesite="lax",
        secure=False
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_data)
    )

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, response: Response, db: AsyncIOMotorDatabase = Depends(get_database)):
    normalized_email = user_in.email.lower().strip()
    existing = await db["users"].find_one({"email": normalized_email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    
    hashed_password = get_password_hash(user_in.password)
    now = datetime.utcnow()
    user_doc = {
        "name": user_in.name.strip(),
        "email": normalized_email,
        "hashed_password": hashed_password,
        "timezone": user_in.timezone or "Asia/Kolkata",
        "theme": "light",
        "created_at": now,
        "updated_at": now
    }
    result = await db["users"].insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    user_data = user_helper(user_doc)

    access_token = create_access_token(user_data["id"])
    refresh_token = create_refresh_token(user_data["id"])

    # Set httpOnly cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        samesite="lax",
        secure=False # set to True in production with HTTPS
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_data)
    )

@router.post("/google", response_model=TokenResponse)
async def google_login(
    req: GoogleLoginRequest,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Verify token with Google's tokeninfo API
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={req.token}")
            if res.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Google ID token."
                )
            google_data = res.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google authentication failed: {str(e)}"
        )

    email = google_data.get("email", "").lower().strip()
    name = google_data.get("name", "Google User")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not provide an email address."
        )

    user = await db["users"].find_one({"email": email})
    now = datetime.utcnow()

    if not user:
        # Auto-register new Google user
        user_doc = {
            "name": name,
            "email": email,
            "hashed_password": "", # OAuth user, no password
            "google_id": google_data.get("sub"),
            "timezone": "Asia/Kolkata",
            "theme": "light",
            "created_at": now,
            "updated_at": now
        }
        ins = await db["users"].insert_one(user_doc)
        user_doc["_id"] = ins.inserted_id
        user_data = user_helper(user_doc)
    else:
        user_data = user_helper(user)

    access_token = create_access_token(user_data["id"])
    refresh_token = create_refresh_token(user_data["id"])

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        samesite="lax",
        secure=False
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_data)
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, response: Response, db: AsyncIOMotorDatabase = Depends(get_database)):
    normalized_email = credentials.email.lower().strip()
    user = await db["users"].find_one({"email": normalized_email})
    if not user or not verify_password(credentials.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_data = user_helper(user)
    access_token = create_access_token(user_data["id"])
    refresh_token = create_refresh_token(user_data["id"])

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        samesite="lax",
        secure=False
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_data)
    )

@router.post("/refresh")
async def refresh_token(request: Request, response: Response, db: AsyncIOMotorDatabase = Depends(get_database)):
    token = request.cookies.get("refresh_token")
    if not token:
        # Fallback to authorization header if provided
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing."
        )

    payload = decode_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    user_id = payload.get("sub")
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )

    new_access_token = create_access_token(user_id)
    new_refresh_token = create_refresh_token(user_id)

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        samesite="lax",
        secure=False
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "user": UserResponse(**user_helper(user))
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="refresh_token")
    return {"message": "Logged out successfully."}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

@router.patch("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    updates = {}
    if user_update.name is not None and user_update.name.strip():
        updates["name"] = user_update.name.strip()
    if user_update.timezone is not None and user_update.timezone.strip():
        updates["timezone"] = user_update.timezone.strip()
    if user_update.theme is not None and user_update.theme.strip():
        updates["theme"] = user_update.theme.strip()

    if updates:
        updates["updated_at"] = datetime.utcnow()
        await db["users"].update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": updates}
        )
        updated_doc = await db["users"].find_one({"_id": ObjectId(current_user["id"])})
        return UserResponse(**user_helper(updated_doc))

    return UserResponse(**current_user)

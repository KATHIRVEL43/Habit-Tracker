import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_auth_flow():
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    user_payload = {
        "name": "Alex Test",
        "email": unique_email,
        "password": "strongPassword123",
        "timezone": "Asia/Kolkata"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register
        reg_res = await ac.post("/api/v1/auth/register", json=user_payload)
        assert reg_res.status_code == 201
        data = reg_res.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["name"] == "Alex Test"
        token = data["access_token"]

        # 2. Reject duplicate email
        dup_res = await ac.post("/api/v1/auth/register", json=user_payload)
        assert dup_res.status_code == 400

        # 3. Login with correct password
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": unique_email,
            "password": "strongPassword123"
        })
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

        # 4. Login with bad password
        bad_login = await ac.post("/api/v1/auth/login", json={
            "email": unique_email,
            "password": "wrongPassword"
        })
        assert bad_login.status_code == 401

        # 5. Access /auth/me with Bearer token
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await ac.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["email"] == unique_email

        # 6. Update user profile
        patch_res = await ac.patch(
            "/api/v1/auth/me",
            headers=headers,
            json={"name": "Alex Updated", "timezone": "America/New_York"}
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["name"] == "Alex Updated"
        assert patch_res.json()["timezone"] == "America/New_York"

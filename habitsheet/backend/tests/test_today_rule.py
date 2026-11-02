import pytest
import uuid
from datetime import timedelta
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.timezone import get_user_today_date, get_user_today_str

@pytest.mark.asyncio
async def test_today_and_date_toggle_rule():
    user_email = f"rule_test_{uuid.uuid4().hex[:8]}@example.com"
    user_payload = {
        "name": "Rule Checker",
        "email": user_email,
        "password": "pass1234Password",
        "timezone": "Asia/Kolkata"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register & get auth token
        reg_res = await ac.post("/api/v1/auth/register", json=user_payload)
        assert reg_res.status_code == 201
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create habit
        habit_res = await ac.post("/api/v1/habits", headers=headers, json={
            "name": "Daily Code",
            "monthly_goal": 25,
            "color": "#8D2D5B",
            "emoji": "💻",
            "active_days": [0, 1, 2, 3, 4, 5, 6]
        })
        assert habit_res.status_code == 201
        habit = habit_res.json()
        habit_id = habit["id"]

        today_str = get_user_today_str("Asia/Kolkata")

        # 3. Toggle TODAY via /toggle
        toggle_res = await ac.put("/api/v1/logs/toggle", headers=headers, json={
            "habit_id": habit_id,
            "completed": True
        })
        assert toggle_res.status_code == 200
        assert toggle_res.json()["date"] == today_str
        assert toggle_res.json()["completed"] is True

        # 4. Toggle specific date
        specific_date = f"{today_str[:7]}-15"
        date_res = await ac.put(
            f"/api/v1/logs/{habit_id}/{specific_date}",
            headers=headers,
            json={"completed": True}
        )
        assert date_res.status_code == 200
        assert date_res.json()["date"] == specific_date
        assert date_res.json()["completed"] is True

        # 5. Fetch Month View
        month_param = today_str[:7]
        month_res = await ac.get(f"/api/v1/logs?month={month_param}", headers=headers)
        assert month_res.status_code == 200
        mdata = month_res.json()
        assert mdata["server_today"] == today_str
        assert mdata["logs"][habit_id][today_str] is True
        assert mdata["logs"][habit_id][specific_date] is True

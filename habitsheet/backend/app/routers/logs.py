from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone, date
import calendar
from bson import ObjectId
from typing import Dict, Any, Set

from app.core.database import get_database
from app.core.dependencies import get_current_user
from app.core.timezone import get_user_today_str, get_user_today_date
from app.schemas.log import (
    LogToggleRequest,
    LogDirectUpdateRequest,
    LogResponse,
    MonthViewResponse,
    HabitMonthSummary
)
from app.schemas.habit import HabitResponse
from app.models.habit import habit_helper
from app.models.log import log_helper
from app.services.streak_service import calculate_habit_streaks

router = APIRouter(prefix="/logs", tags=["Logs"])

@router.get("", response_model=MonthViewResponse)
async def get_month_logs(
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$", description="Month in YYYY-MM format"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_tz = current_user.get("timezone", "Asia/Kolkata")
    server_today_str = get_user_today_str(user_tz)
    server_today_date = get_user_today_date(user_tz)

    try:
        year, month_num = map(int, month.split("-"))
        _, days_in_month = calendar.monthrange(year, month_num)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid month format. Expected YYYY-MM.")

    # 1. Fetch user's active habits
    habits_cursor = db["habits"].find({"user_id": current_user["id"], "archived": {"$ne": True}}).sort("order", 1)
    habits = []
    habit_ids = []
    async for h_doc in habits_cursor:
        h_resp = HabitResponse(**habit_helper(h_doc))
        habits.append(h_resp)
        habit_ids.append(h_resp.id)

    # 2. Fetch all logs for this user up to end of selected month (to accurately compute streaks)
    month_start = f"{month}-01"
    month_end = f"{month}-{days_in_month:02d}"

    logs_cursor = db["habit_logs"].find({
        "user_id": current_user["id"],
        "habit_id": {"$in": habit_ids}
    })
    
    # Organize logs by habit
    # habit_id -> { "YYYY-MM-DD": True/False }
    month_logs_map: Dict[str, Dict[str, bool]] = {hid: {} for hid in habit_ids}
    # habit_id -> set of completed "YYYY-MM-DD"
    all_completed_by_habit: Dict[str, Set[str]] = {hid: set() for hid in habit_ids}

    async for log_doc in logs_cursor:
        hid = log_doc.get("habit_id")
        d_str = log_doc.get("date")
        completed = log_doc.get("completed", False)
        if completed:
            all_completed_by_habit.setdefault(hid, set()).add(d_str)
        if d_str.startswith(month) and hid in month_logs_map:
            month_logs_map[hid][d_str] = completed

    # 3. Compute summaries and streaks for each habit
    summaries: Dict[str, HabitMonthSummary] = {}
    total_completed = 0
    total_goals = 0

    for habit in habits:
        completed_in_month = sum(1 for d, done in month_logs_map.get(habit.id, {}).items() if done)
        goal = habit.monthly_goal or 1
        pct = round((completed_in_month / goal) * 100, 1)

        curr_streak, best_streak = calculate_habit_streaks(
            active_days=habit.active_days,
            completed_dates=all_completed_by_habit.get(habit.id, set()),
            today=server_today_date
        )

        summaries[habit.id] = HabitMonthSummary(
            habit_id=habit.id,
            completed_count=completed_in_month,
            goal=habit.monthly_goal,
            completion_rate=pct,
            current_streak=curr_streak,
            best_streak=best_streak
        )
        total_completed += completed_in_month
        total_goals += habit.monthly_goal

    overall_progress = round((total_completed / max(total_goals, 1)) * 100, 1)

    return MonthViewResponse(
        month=month,
        server_today=server_today_str,
        days_in_month=days_in_month,
        habits=habits,
        logs=month_logs_map,
        summaries=summaries,
        overall_progress=overall_progress
    )

@router.put("/toggle", response_model=LogResponse)
async def toggle_today_log(
    req: LogToggleRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Toggles completion for a given date or defaults to today in user's timezone.
    Supports daily dates (YYYY-MM-DD), weekly targets (YYYY-MM-W1..5), and monthly (YYYY-MM-M).
    """
    user_tz = current_user.get("timezone", "Asia/Kolkata")
    target_date_str = req.date.strip() if req.date and req.date.strip() else get_user_today_str(user_tz)

    try:
        h_oid = ObjectId(req.habit_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid habit ID format.")

    habit = await db["habits"].find_one({"_id": h_oid, "user_id": current_user["id"], "archived": {"$ne": True}})
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found or archived.")

    now = datetime.now(timezone.utc)
    updated = await db["habit_logs"].find_one_and_update(
        {
            "habit_id": req.habit_id,
            "date": target_date_str
        },
        {
            "$set": {
                "user_id": current_user["id"],
                "completed": req.completed,
                "updated_at": now
            },
            "$setOnInsert": {
                "created_at": now
            }
        },
        upsert=True,
        return_document=True
    )

    return LogResponse(**log_helper(updated))

@router.put("/{habit_id}/{date_str}", response_model=LogResponse)
async def update_date_log(
    habit_id: str,
    date_str: str,
    req: LogDirectUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    return await toggle_today_log(
        LogToggleRequest(habit_id=habit_id, completed=req.completed, date=date_str),
        current_user=current_user,
        db=db
    )

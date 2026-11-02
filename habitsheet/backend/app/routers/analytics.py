from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, date, timedelta
from typing import List, Dict, Any

from app.core.database import get_database
from app.core.dependencies import get_current_user
from app.core.timezone import get_user_today_str, get_user_today_date
from app.services.streak_service import calculate_habit_streaks
from app.models.habit import habit_helper

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
async def get_analytics_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_tz = current_user.get("timezone", "Asia/Kolkata")
    today = get_user_today_date(user_tz)
    today_str = get_user_today_str(user_tz)
    current_month_str = today.strftime("%Y-%m")

    # Habits
    habits_cursor = db["habits"].find({"user_id": current_user["id"], "archived": {"$ne": True}})
    habits = []
    habit_map = {}
    async for h in habits_cursor:
        data = habit_helper(h)
        habits.append(data)
        habit_map[data["id"]] = data

    habit_ids = list(habit_map.keys())

    # Logs for this month
    logs_cursor = db["habit_logs"].find({
        "user_id": current_user["id"],
        "habit_id": {"$in": habit_ids},
        "completed": True
    })

    month_completions = 0
    today_completed_count = 0
    completed_by_habit: Dict[str, set] = {hid: set() for hid in habit_ids}

    async for log in logs_cursor:
        hid = log.get("habit_id")
        d_str = log.get("date")
        if hid in completed_by_habit:
            completed_by_habit[hid].add(d_str)
        if d_str.startswith(current_month_str):
            month_completions += 1
        if d_str == today_str:
            today_completed_count += 1

    # Streaks calculation
    top_streak_habit = None
    max_streak = 0
    total_goals = sum(h.get("monthly_goal", 0) for h in habits)

    for h in habits:
        curr, best = calculate_habit_streaks(
            active_days=h.get("active_days", []),
            completed_dates=completed_by_habit.get(h["id"], set()),
            today=today
        )
        if curr > max_streak:
            max_streak = curr
            top_streak_habit = h["name"]

    # Active habits scheduled for today
    today_scheduled_count = sum(
        1 for h in habits if today.weekday() in h.get("active_days", [0, 1, 2, 3, 4, 5, 6])
    )

    return {
        "total_habits": len(habits),
        "today_scheduled": today_scheduled_count,
        "today_completed": today_completed_count,
        "today_completion_pct": round((today_completed_count / max(today_scheduled_count, 1)) * 100, 1),
        "month_completions": month_completions,
        "total_goals": total_goals,
        "month_completion_pct": round((month_completions / max(total_goals, 1)) * 100, 1),
        "best_streak_habit": top_streak_habit or "None",
        "best_streak_days": max_streak,
    }

@router.get("/heatmap")
async def get_heatmap(
    year: int = Query(default=2026),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    year_str = str(year)
    habits_count = await db["habits"].count_documents({"user_id": current_user["id"], "archived": {"$ne": True}})
    
    logs_cursor = db["habit_logs"].find({
        "user_id": current_user["id"],
        "date": {"$regex": f"^{year_str}-"},
        "completed": True
    })

    date_counts: Dict[str, int] = {}
    async for doc in logs_cursor:
        d = doc.get("date")
        date_counts[d] = date_counts.get(d, 0) + 1

    result = []
    for d, count in date_counts.items():
        result.append({
            "date": d,
            "count": count,
            "total_habits": habits_count,
            "level": min(4, int((count / max(habits_count, 1)) * 4)) if count > 0 else 0
        })

    result.sort(key=lambda x: x["date"])
    return result

@router.get("/streaks")
async def get_streak_leaderboard(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_tz = current_user.get("timezone", "Asia/Kolkata")
    today = get_user_today_date(user_tz)

    habits_cursor = db["habits"].find({"user_id": current_user["id"], "archived": {"$ne": True}})
    habits = []
    async for h in habits_cursor:
        habits.append(habit_helper(h))

    habit_ids = [h["id"] for h in habits]
    logs_cursor = db["habit_logs"].find({
        "user_id": current_user["id"],
        "habit_id": {"$in": habit_ids},
        "completed": True
    })

    completed_by_habit: Dict[str, set] = {hid: set() for hid in habit_ids}
    async for log in logs_cursor:
        completed_by_habit.setdefault(log["habit_id"], set()).add(log["date"])

    leaderboard = []
    for h in habits:
        curr, best = calculate_habit_streaks(
            active_days=h.get("active_days", []),
            completed_dates=completed_by_habit.get(h["id"], set()),
            today=today
        )
        leaderboard.append({
            "id": h["id"],
            "name": h["name"],
            "emoji": h["emoji"],
            "color": h["color"],
            "current_streak": curr,
            "best_streak": best,
            "total_completed": len(completed_by_habit.get(h["id"], set()))
        })

    leaderboard.sort(key=lambda x: x["current_streak"], reverse=True)
    return leaderboard

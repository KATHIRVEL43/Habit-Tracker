from datetime import datetime, timezone
from typing import Dict, Any

def habit_helper(habit: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(habit["_id"]) if "_id" in habit else str(habit.get("id", "")),
        "user_id": str(habit.get("user_id", "")),
        "name": habit.get("name", ""),
        "frequency": habit.get("frequency", "daily"),
        "monthly_goal": habit.get("monthly_goal", 20),
        "color": habit.get("color", "#8D2D5B"),
        "emoji": habit.get("emoji", "🌸"),
        "active_days": habit.get("active_days", [0, 1, 2, 3, 4, 5, 6]),
        "order": habit.get("order", 0),
        "archived": habit.get("archived", False),
        "created_at": habit.get("created_at", datetime.now(timezone.utc)),
        "updated_at": habit.get("updated_at", datetime.now(timezone.utc)),
    }

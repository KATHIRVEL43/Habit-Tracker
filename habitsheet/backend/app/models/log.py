from datetime import datetime
from typing import Dict, Any

def log_helper(log: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(log["_id"]) if "_id" in log else str(log.get("id", "")),
        "habit_id": str(log.get("habit_id", "")),
        "user_id": str(log.get("user_id", "")),
        "date": str(log.get("date", "")),
        "completed": bool(log.get("completed", False)),
        "created_at": log.get("created_at", datetime.utcnow()),
        "updated_at": log.get("updated_at", datetime.utcnow()),
    }

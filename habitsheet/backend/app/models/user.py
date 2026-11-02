from datetime import datetime
from typing import Optional, Dict, Any
from bson import ObjectId

def user_helper(user: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(user["_id"]) if "_id" in user else str(user.get("id", "")),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "timezone": user.get("timezone", "Asia/Kolkata"),
        "theme": user.get("theme", "light"),
        "created_at": user.get("created_at", datetime.utcnow()),
    }

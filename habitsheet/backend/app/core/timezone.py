from zoneinfo import ZoneInfo
from datetime import datetime, date

def get_user_now(timezone_str: str = "Asia/Kolkata") -> datetime:
    """Returns the current datetime in the user's specific timezone."""
    try:
        tz = ZoneInfo(timezone_str)
    except Exception:
        tz = ZoneInfo("Asia/Kolkata")
    return datetime.now(tz)

def get_user_today_str(timezone_str: str = "Asia/Kolkata") -> str:
    """Returns today's date formatted as YYYY-MM-DD in user's timezone."""
    return get_user_now(timezone_str).strftime("%Y-%m-%d")

def get_user_today_date(timezone_str: str = "Asia/Kolkata") -> date:
    """Returns today's date object in user's timezone."""
    return get_user_now(timezone_str).date()

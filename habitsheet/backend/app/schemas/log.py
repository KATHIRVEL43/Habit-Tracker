from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.habit import HabitResponse

class LogToggleRequest(BaseModel):
    habit_id: str
    completed: bool
    date: Optional[str] = None # YYYY-MM-DD or YYYY-MM-W1..5 or YYYY-MM-M

class LogDirectUpdateRequest(BaseModel):
    completed: bool

class LogResponse(BaseModel):
    id: str
    habit_id: str
    user_id: str
    date: str # YYYY-MM-DD or YYYY-MM-W1..5 or YYYY-MM-M
    completed: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class HabitMonthSummary(BaseModel):
    habit_id: str
    completed_count: int
    goal: int
    completion_rate: float # percentage 0 - 100
    current_streak: int
    best_streak: int

class MonthViewResponse(BaseModel):
    month: str # YYYY-MM
    server_today: str # YYYY-MM-DD
    days_in_month: int
    habits: List[HabitResponse]
    logs: Dict[str, Dict[str, bool]] # habit_id -> { "2026-11-01": true }
    summaries: Dict[str, HabitMonthSummary] # habit_id -> HabitMonthSummary
    overall_progress: float

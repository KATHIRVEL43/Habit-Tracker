from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime

class HabitBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    frequency: Literal["daily", "weekly", "monthly"] = Field(default="daily")
    monthly_goal: int = Field(default=20, ge=0, le=31)
    color: str = Field(default="#8D2D5B") # Plum accent matching reference
    emoji: str = Field(default="🌸")
    active_days: List[int] = Field(default_factory=lambda: [0, 1, 2, 3, 4, 5, 6])

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    frequency: Optional[Literal["daily", "weekly", "monthly"]] = None
    monthly_goal: Optional[int] = Field(None, ge=0, le=31)
    color: Optional[str] = None
    emoji: Optional[str] = None
    active_days: Optional[List[int]] = None
    order: Optional[int] = None
    archived: Optional[bool] = None

class HabitReorderItem(BaseModel):
    id: str
    order: int

class HabitResponse(HabitBase):
    id: str
    user_id: str
    order: int = 0
    archived: bool = False
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

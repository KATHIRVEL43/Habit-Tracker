from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from bson import ObjectId
from typing import List

from app.core.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.habit import HabitCreate, HabitUpdate, HabitResponse, HabitReorderItem
from app.models.habit import habit_helper

router = APIRouter(prefix="/habits", tags=["Habits"])

@router.get("", response_model=List[HabitResponse])
async def list_habits(
    include_archived: bool = False,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {"user_id": current_user["id"]}
    if not include_archived:
        query["archived"] = {"$ne": True}

    cursor = db["habits"].find(query).sort("order", 1)
    habits = []
    async for doc in cursor:
        habits.append(HabitResponse(**habit_helper(doc)))
    return habits

@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(
    habit_in: HabitCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Count current habits to set order
    count = await db["habits"].count_documents({"user_id": current_user["id"], "archived": {"$ne": True}})
    
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": current_user["id"],
        "name": habit_in.name.strip(),
        "frequency": habit_in.frequency,
        "monthly_goal": habit_in.monthly_goal,
        "color": habit_in.color,
        "emoji": habit_in.emoji,
        "active_days": habit_in.active_days,
        "order": count,
        "archived": False,
        "created_at": now,
        "updated_at": now
    }
    result = await db["habits"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return HabitResponse(**habit_helper(doc))

@router.get("/{habit_id}", response_model=HabitResponse)
async def get_habit(
    habit_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(habit_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid habit ID format.")

    doc = await db["habits"].find_one({"_id": oid, "user_id": current_user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Habit not found.")
    return HabitResponse(**habit_helper(doc))

@router.patch("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    habit_in: HabitUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(habit_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid habit ID format.")

    updates = {}
    if habit_in.name is not None:
        updates["name"] = habit_in.name.strip()
    if habit_in.frequency is not None:
        updates["frequency"] = habit_in.frequency
    if habit_in.monthly_goal is not None:
        updates["monthly_goal"] = habit_in.monthly_goal
    if habit_in.color is not None:
        updates["color"] = habit_in.color
    if habit_in.emoji is not None:
        updates["emoji"] = habit_in.emoji
    if habit_in.active_days is not None:
        updates["active_days"] = habit_in.active_days
    if habit_in.order is not None:
        updates["order"] = habit_in.order
    if habit_in.archived is not None:
        updates["archived"] = habit_in.archived

    if not updates:
        doc = await db["habits"].find_one({"_id": oid, "user_id": current_user["id"]})
        if not doc:
            raise HTTPException(status_code=404, detail="Habit not found.")
        return HabitResponse(**habit_helper(doc))

    updates["updated_at"] = datetime.now(timezone.utc)
    res = await db["habits"].find_one_and_update(
        {"_id": oid, "user_id": current_user["id"]},
        {"$set": updates},
        return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Habit not found.")
    return HabitResponse(**habit_helper(res))

@router.delete("/{habit_id}", status_code=status.HTTP_200_OK)
async def delete_habit(
    habit_id: str,
    hard_delete: bool = False,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(habit_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid habit ID format.")

    if hard_delete:
        res = await db["habits"].delete_one({"_id": oid, "user_id": current_user["id"]})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Habit not found.")
        # Also clean up associated logs
        await db["habit_logs"].delete_many({"habit_id": habit_id})
        return {"message": "Habit permanently deleted."}
    else:
        res = await db["habits"].update_one(
            {"_id": oid, "user_id": current_user["id"]},
            {"$set": {"archived": True, "updated_at": datetime.now(timezone.utc)}}
        )
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Habit not found.")
        return {"message": "Habit archived successfully."}

@router.put("/reorder", response_model=List[HabitResponse])
async def reorder_habits(
    items: List[HabitReorderItem],
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    for item in items:
        try:
            oid = ObjectId(item.id)
            await db["habits"].update_one(
                {"_id": oid, "user_id": current_user["id"]},
                {"$set": {"order": item.order, "updated_at": datetime.now(timezone.utc)}}
            )
        except Exception:
            continue
    
    # Return sorted habits
    cursor = db["habits"].find({"user_id": current_user["id"], "archived": {"$ne": True}}).sort("order", 1)
    habits = []
    async for doc in cursor:
        habits.append(HabitResponse(**habit_helper(doc)))
    return habits

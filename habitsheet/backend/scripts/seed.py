import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash
from app.core.timezone import get_user_today_date

async def seed_data():
    print(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]

    email = "demo@habitsheet.app"
    await db["users"].delete_many({"email": email})
    
    # Create demo user
    now = datetime.now(timezone.utc)
    user_doc = {
        "name": "Planner Demo",
        "email": email,
        "hashed_password": get_password_hash("demo12345"),
        "timezone": "Asia/Kolkata",
        "theme": "plum",
        "created_at": now,
        "updated_at": now
    }
    user_res = await db["users"].insert_one(user_doc)
    user_id = str(user_res.inserted_id)
    print(f"Created demo user: {email} (ID: {user_id})")

    # Clean existing habits & logs for this user
    await db["habits"].delete_many({"user_id": user_id})
    await db["habit_logs"].delete_many({"user_id": user_id})

    # 1. 15 Daily Habits (matching Image 1)
    daily_habits = [
        {"name": "Habit 1 — Morning Yoga & Stretch", "goal": 25, "emoji": "🧘"},
        {"name": "Habit 2 — Drink 2.5L Water", "goal": 28, "emoji": "💧"},
        {"name": "Habit 3 — Read 20 Pages", "goal": 20, "emoji": "📖"},
        {"name": "Habit 4 — 30 Min Workout / Cardio", "goal": 20, "emoji": "🏃"},
        {"name": "Habit 5 — Meditate 10 Mins", "goal": 15, "emoji": "🕯️"},
        {"name": "Habit 6 — Healthy Clean Meal", "goal": 25, "emoji": "🥗"},
        {"name": "Habit 7 — Deep Work Block (2h)", "goal": 20, "emoji": "💻"},
        {"name": "Habit 8 — Journal / Reflection", "goal": 15, "emoji": "✍️"},
        {"name": "Habit 9 — No Sugar / Healthy Snack", "goal": 20, "emoji": "🍎"},
        {"name": "Habit 10 — Take Multivitamins", "goal": 30, "emoji": "💊"},
        {"name": "Habit 11 — Sleep Before 11 PM", "goal": 20, "emoji": "🛌"},
        {"name": "Habit 12 — 10,000 Daily Steps", "goal": 22, "emoji": "👟"},
        {"name": "Habit 13 — Learn New Skill / Language", "goal": 15, "emoji": "🎓"},
        {"name": "Habit 14 — Outdoor Walk & Sunshine", "goal": 20, "emoji": "🌿"},
        {"name": "Habit 15 — Evening Screen Detoxing", "goal": 15, "emoji": "🌙"},
    ]

    # Daily checks pattern matching Image 1:
    # Habits 1..4 have high completion; 5..8 moderate; 9..11 occasional; 12..15 fresh
    daily_pattern = {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 16, 17, 18, 19, 21, 22, 24, 25, 27, 28, 30], # Habit 1
        1: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 14, 16, 17, 21, 22, 24, 25, 29, 30],           # Habit 2
        2: [1, 2, 4, 6, 7, 10, 14, 16, 17, 21, 24, 26, 27, 29],                                  # Habit 3
        3: [1, 2, 3, 4, 5, 6, 7, 10, 14, 16, 17, 18, 22, 24, 25, 29, 30],                       # Habit 4
        4: [2, 3, 10, 11, 14, 17, 20, 21],                                                       # Habit 5
        5: [3, 10, 11, 14, 17, 18, 19, 20],                                                       # Habit 6
        6: [3, 11, 17, 21],                                                                       # Habit 7
        7: [3, 11, 17, 22],                                                                       # Habit 8
        8: [17],                                                                                  # Habit 9
        9: [17],                                                                                  # Habit 10
        10: [17],                                                                                 # Habit 11
        11: [],
        12: [],
        13: [],
        14: [],
    }

    today = get_user_today_date("Asia/Kolkata")
    current_month_str = today.strftime("%Y-%m")

    logs_to_insert = []

    for idx, h in enumerate(daily_habits):
        h_doc = {
            "user_id": user_id,
            "name": h["name"],
            "frequency": "daily",
            "monthly_goal": h["goal"],
            "color": "#8D2D5B",
            "emoji": h["emoji"],
            "active_days": [0, 1, 2, 3, 4, 5, 6],
            "order": idx,
            "archived": False,
            "created_at": now - timedelta(days=60),
            "updated_at": now
        }
        res = await db["habits"].insert_one(h_doc)
        habit_id = str(res.inserted_id)

        # Insert check logs for days in month
        completed_days = daily_pattern.get(idx, [])
        for d in completed_days:
            date_str = f"{current_month_str}-{d:02d}"
            logs_to_insert.append({
                "habit_id": habit_id,
                "user_id": user_id,
                "date": date_str,
                "completed": True,
                "created_at": now,
                "updated_at": now
            })

    # 2. 15 Weekly Habits (matching Image 2)
    weekly_habits = [
        {"name": "Habit 1 — Meal Prep for Week", "emoji": "🍲", "weeks": [1, 2, 3, 4]},
        {"name": "Habit 2 — Clean Apartment / Vacuum", "emoji": "🧹", "weeks": [2, 3, 4, 5]},
        {"name": "Habit 3 — Budget & Expense Audit", "emoji": "💰", "weeks": [1, 2, 4, 5]},
        {"name": "Habit 4 — Laundry & Linen Wash", "emoji": "🧺", "weeks": [2, 3, 4, 5]},
        {"name": "Habit 5 — Call Family & Friends", "emoji": "📞", "weeks": [2, 3, 4, 5]},
        {"name": "Habit 6 — Weekly Goals Review", "emoji": "📋", "weeks": []},
        {"name": "Habit 7 — Water Houseplants", "emoji": "🪴", "weeks": []},
        {"name": "Habit 8 — Digital Backup & Cleanup", "emoji": "💾", "weeks": []},
        {"name": "Habit 9 — Long Hike or Nature Trip", "emoji": "🌲", "weeks": []},
        {"name": "Habit 10 — Face Mask & Self-Care", "emoji": "✨", "weeks": []},
        {"name": "Habit 11 — Vehicle / Bike Maintenance", "emoji": "🚲", "weeks": []},
        {"name": "Habit 12 — Declutter One Drawer", "emoji": "📦", "weeks": []},
        {"name": "Habit 13 — Read Weekly Digest", "emoji": "📰", "weeks": []},
        {"name": "Habit 14 — Restock Pantry Groceries", "emoji": "🛒", "weeks": []},
        {"name": "Habit 15 — Plan Upcoming Week", "emoji": "🗓️", "weeks": []},
    ]

    for idx, h in enumerate(weekly_habits):
        h_doc = {
            "user_id": user_id,
            "name": h["name"],
            "frequency": "weekly",
            "monthly_goal": 4,
            "color": "#9D3364",
            "emoji": h["emoji"],
            "active_days": [0, 1, 2, 3, 4, 5, 6],
            "order": idx,
            "archived": False,
            "created_at": now - timedelta(days=60),
            "updated_at": now
        }
        res = await db["habits"].insert_one(h_doc)
        habit_id = str(res.inserted_id)

        for w in h["weeks"]:
            date_str = f"{current_month_str}-W{w}"
            logs_to_insert.append({
                "habit_id": habit_id,
                "user_id": user_id,
                "date": date_str,
                "completed": True,
                "created_at": now,
                "updated_at": now
            })

    # 3. 15 Monthly Habits (matching Image 2)
    monthly_habits = [
        {"name": "Habit 1 — Pay Monthly Rent & Utilities", "emoji": "🏠", "done": True},
        {"name": "Habit 2 — Monthly Health Checkup / Doctor", "emoji": "🩺", "done": False},
        {"name": "Habit 3 — Deep Clean Car & Wardrobe", "emoji": "🚗", "done": True},
        {"name": "Habit 4 — Review Monthly Investments", "emoji": "📈", "done": False},
        {"name": "Habit 5 — Try 1 New Creative Recipe", "emoji": "🧑‍🍳", "done": False},
        {"name": "Habit 6 — Donate to Charity / Goodwill", "emoji": "🎁", "done": False},
        {"name": "Habit 7 — Replace Toothbrush & Filters", "emoji": "🪥", "done": False},
        {"name": "Habit 8 — Visit Museum or Art Exhibit", "emoji": "🏛️", "done": False},
        {"name": "Habit 9 — Check Tire Pressure & Fluids", "emoji": "⚙️", "done": False},
        {"name": "Habit 10 — Organize Cloud Photos", "emoji": "📸", "done": False},
        {"name": "Habit 11 — Audit Recurring Subscriptions", "emoji": "💳", "done": False},
        {"name": "Habit 12 — Try a New Restaurant", "emoji": "🍣", "done": False},
        {"name": "Habit 13 — Write in Memory Book", "emoji": "📔", "done": False},
        {"name": "Habit 14 — Check Smoke Detectors", "emoji": "🚨", "done": False},
        {"name": "Habit 15 — Celebrate Monthly Wins!", "emoji": "🎉", "done": True},
    ]

    for idx, h in enumerate(monthly_habits):
        h_doc = {
            "user_id": user_id,
            "name": h["name"],
            "frequency": "monthly",
            "monthly_goal": 1,
            "color": "#8D2D5B",
            "emoji": h["emoji"],
            "active_days": [0, 1, 2, 3, 4, 5, 6],
            "order": idx,
            "archived": False,
            "created_at": now - timedelta(days=60),
            "updated_at": now
        }
        res = await db["habits"].insert_one(h_doc)
        habit_id = str(res.inserted_id)

        if h["done"]:
            date_str = f"{current_month_str}-M"
            logs_to_insert.append({
                "habit_id": habit_id,
                "user_id": user_id,
                "date": date_str,
                "completed": True,
                "created_at": now,
                "updated_at": now
            })

    if logs_to_insert:
        await db["habit_logs"].insert_many(logs_to_insert)

    print(f"Successfully seeded demo data: 15 Daily Habits, 15 Weekly Habits, 15 Monthly Habits, and {len(logs_to_insert)} check-ins matching reference design!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())

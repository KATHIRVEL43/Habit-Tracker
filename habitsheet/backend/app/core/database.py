import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_manager = DatabaseManager()

async def get_database() -> AsyncIOMotorDatabase:
    needs_reconnect = False
    if db_manager.client is None or db_manager.db is None:
        needs_reconnect = True
    else:
        try:
            loop = db_manager.client.get_io_loop()
            if loop.is_closed():
                needs_reconnect = True
        except Exception:
            needs_reconnect = True

    if needs_reconnect:
        await connect_to_mongo()
    return db_manager.db

async def connect_to_mongo():
    logger.info("Connecting to MongoDB at: %s", settings.MONGODB_URI)
    db_manager.client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        serverSelectionTimeoutMS=5000
    )
    db_manager.db = db_manager.client[settings.DATABASE_NAME]
    
    # Initialize collections and indexes
    try:
        # Ping
        await db_manager.client.admin.command('ping')
        logger.info("Connected to MongoDB successfully.")
        await init_db_indexes(db_manager.db)
    except Exception as e:
        logger.warning("MongoDB ping warning (check if MongoDB service is running): %s", e)

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db_manager.client:
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

async def init_db_indexes(db: AsyncIOMotorDatabase):
    """
    Sets up required unique and compound indexes as specified in §5:
    - users: email unique
    - habits: (user_id, archived)
    - habit_logs: compound unique (habit_id, date)
    - habit_logs: (user_id, date)
    """
    try:
        # Users
        await db["users"].create_index("email", unique=True)
        
        # Habits
        await db["habits"].create_index([("user_id", 1), ("archived", 1)])
        
        # Habit Logs
        await db["habit_logs"].create_index(
            [("habit_id", 1), ("date", 1)],
            unique=True
        )
        await db["habit_logs"].create_index([("user_id", 1), ("date", 1)])
        logger.info("MongoDB indexes verified/created.")
    except Exception as e:
        logger.error("Failed to initialize indexes: %s", e)

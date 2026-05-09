from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.client = None
        self.db = None

    async def connect(self):
        if not self.client:
            try:
                self.client = AsyncIOMotorClient(settings.MONGODB_URL)
                self.db = self.client.jobscout_db
                logger.info("Successfully connected to MongoDB")
            except Exception as e:
                logger.error(f"Error connecting to MongoDB: {e}")
                raise e

    async def save_cv(self, cv_data: dict):
        if not self.db:
            await self.connect()
        result = await self.db.cv_collection.insert_one(cv_data)
        return str(result.inserted_id)

    async def get_latest_cv(self):
        if not self.db:
            await self.connect()
        return await self.db.cv_collection.find_one(sort=[("_id", -1)])

    async def save_chat_message(self, chat_data: dict):
        if not self.db:
            await self.connect()
        await self.db.chat_history.insert_one(chat_data)

    async def get_chat_history(self, limit: int = 50):
        if not self.db:
            await self.connect()
        cursor = self.db.chat_history.find().sort("timestamp", 1).limit(limit)
        return await cursor.to_list(length=limit)

    async def save_results(self, results_data: dict):
        if not self.db:
            await self.connect()
        await self.db.search_results.insert_one(results_data)

    async def get_latest_results(self):
        if not self.db:
            await self.connect()
        return await self.db.search_results.find_one(sort=[("_id", -1)])

db_service = DatabaseService()

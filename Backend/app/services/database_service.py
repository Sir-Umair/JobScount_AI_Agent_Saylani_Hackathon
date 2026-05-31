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
        if self.db is None:
            await self.connect()
        result = await self.db.cv_collection.insert_one(cv_data)
        return str(result.inserted_id)

    async def get_latest_cv(self):
        if self.db is None:
            await self.connect()
        return await self.db.cv_collection.find_one(sort=[("_id", -1)])

    async def save_chat_message(self, chat_data: dict):
        if self.db is None:
            await self.connect()
        await self.db.chat_history.insert_one(chat_data)

    async def get_chat_history(self, limit: int = 50):
        if self.db is None:
            await self.connect()
        cursor = self.db.chat_history.find().sort("timestamp", 1).limit(limit)
        return await cursor.to_list(length=limit)

    async def save_results(self, results_data: dict):
        if self.db is None:
            await self.connect()
        await self.db.search_results.insert_one(results_data)

    async def get_latest_results(self):
        if self.db is None:
            await self.connect()
        return await self.db.search_results.find_one(sort=[("_id", -1)])

    async def save_job(self, cv_id: str, job_data: dict):
        if self.db is None:
            await self.connect()
        # Save a job to a specific cv collection
        document = {
            "cv_id": cv_id,
            "job": job_data
        }
        await self.db.saved_jobs.insert_one(document)

    def _extract_job_name(self, job: dict) -> str | None:
        """Extract a display name for a job from various possible fields."""
        # Direct fields
        for key in ["name", "title", "candidate_name", "full_name"]:
            if job.get(key):
                return job[key]
        # Nested candidate object
        candidate = job.get("candidate")
        if isinstance(candidate, dict):
            for key in ["name", "full_name"]:
                if candidate.get(key):
                    return candidate[key]
        return None

    async def get_saved_jobs(self, cv_id: str):
        """Return a list of saved job dictionaries for the given CV ID, ensuring each includes a 'name' key using the extraction helper."""
        if self.db is None:
            await self.connect()
        cursor = self.db.saved_jobs.find({"cv_id": cv_id})
        docs = await cursor.to_list(length=100)
        result = []
        for doc in docs:
            job = doc.get("job", {})
            name = await self._extract_job_name(job)
            if name:
                job["name"] = name
            result.append(job)
        return result



    async def delete_saved_job(self, cv_id: str, job_url: str):
        """Delete a saved job identified by its URL for a given CV ID."""
        if self.db is None:
            await self.connect()
        await self.db.saved_jobs.delete_one({"cv_id": cv_id, "job.job_url": job_url})

    async def get_saved_job_names_by_cv_id(self, cv_id: str):
        """Return a list of the `name` field (or fallback to title) for each saved job associated with the given CV ID."""
        if self.db is None:
            await self.connect()
        cursor = self.db.saved_jobs.find({"cv_id": cv_id})
        docs = await cursor.to_list(length=100)
        names = []
        for doc in docs:
            job = doc.get("job", {})
            name = job.get("name") or job.get("title")
            if name:
                names.append(name)
        return names


    async def search_saved_jobs(self, query: str, limit: int = 20):
        """
        Search saved jobs by a text query applied to job title or description.
        Uses a case-insensitive regex for matching.
        """
        if self.db is None:
            await self.connect()
        filter_criteria = {
            "$or": [
                {"job.title": {"$regex": query, "$options": "i"}},
                {"job.description": {"$regex": query, "$options": "i"}}
            ]
        }
        cursor = self.db.saved_jobs.find(filter_criteria).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [doc["job"] for doc in docs]

    async def count_filtered_jobs(self, query: str):
        """
        Return count of jobs matching the same filter criteria as `search_saved_jobs`.
        """
        if self.db is None:
            await self.connect()
        filter_criteria = {
            "$or": [
                {"job.title": {"$regex": query, "$options": "i"}},
                {"job.description": {"$regex": query, "$options": "i"}}
            ]
        }
        return await self.db.saved_jobs.count_documents(filter_criteria)


db_service = DatabaseService()

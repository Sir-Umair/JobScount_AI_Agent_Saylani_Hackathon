import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def test_db():
    load_dotenv()
    url = os.getenv("MONGODB_URL")
    print(f"Testing connection to: {url[:20]}...")
    try:
        client = AsyncIOMotorClient(url)
        # The is_master command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("MongoDB Connection Successful!")
    except Exception as e:
        print(f"MongoDB Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_db())

from tavily import TavilyClient
from app.config.settings import settings
from app.utils.helpers import setup_logger
import time

logger = setup_logger("tavily_service")

# Initialize client if key exists
try:
    if settings.TAVILY_API_KEY:
        tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)
    else:
        tavily_client = None
except Exception as e:
    logger.error(f"Failed to initialize Tavily client: {e}")
    tavily_client = None

def search_jobs(query: str, max_results: int = 5) -> list[dict]:
    if not tavily_client:
        logger.warning("Tavily client not initialized. Cannot perform search.")
        return []

    max_retries = 3
    for attempt in range(max_retries):
        try:
            logger.info(f"Searching Tavily for query: {query} (Attempt {attempt + 1}/{max_retries})")
            response = tavily_client.search(query=query, max_results=max_results)
            results = response.get("results", [])
            if not results:
                 logger.warning(f"Tavily returned 0 results on attempt {attempt + 1}.")
                 if attempt < max_retries - 1:
                     time.sleep(1)
                     continue
                 return []
            return results
        except Exception as e:
            logger.error(f"Tavily search failed on attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            return []


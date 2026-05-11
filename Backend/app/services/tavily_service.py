from tavily import TavilyClient
from app.config.settings import settings
from app.utils.helpers import setup_logger

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

    try:
        logger.info(f"Searching Tavily for query: {query}")
        response = tavily_client.search(query=query, max_results=max_results)
        results = response.get("results", [])
        if not results:
             logger.warning("Tavily returned 0 results.")
             return []
        return results
    except Exception as e:
        logger.error(f"Tavily search failed for query '{query}': {e}.")
        return []

from app.utils.helpers import setup_logger

logger = setup_logger("cache_service")

_cache = {}

def get_cached_search(query: str):
    return _cache.get(query)

def set_cached_search(query: str, results: list):
    _cache[query] = results

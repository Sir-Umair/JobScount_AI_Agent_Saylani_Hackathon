from sentence_transformers import SentenceTransformer
from app.utils.helpers import setup_logger

logger = setup_logger("embedding_service")

_model = None

def get_model():
    global _model
    if _model is None:
        logger.info("Loading SentenceTransformer model (all-MiniLM-L6-v2)...")
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def get_embeddings(texts: list[str]) -> list[list[float]]:
    logger.info(f"Generating embeddings for {len(texts)} chunks.")
    model = get_model()
    embeddings = model.encode(texts, convert_to_numpy=True)
    return embeddings.tolist()

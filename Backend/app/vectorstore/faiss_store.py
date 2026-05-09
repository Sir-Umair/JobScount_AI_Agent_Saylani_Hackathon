import faiss
import numpy as np
from app.utils.helpers import setup_logger

logger = setup_logger("faiss_store")

class FAISSStore:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.chunks = []

    def add_embeddings(self, embeddings: list[list[float]], chunks: list[str]):
        if not embeddings:
            return
        
        vectors = np.array(embeddings).astype('float32')
        self.index.add(vectors)
        self.chunks.extend(chunks)
        logger.info(f"Added {len(embeddings)} vectors to FAISS index.")

    def search(self, query_embedding: list[float], k: int = 5) -> list[str]:
        if self.index.ntotal == 0:
            return []
        
        vector = np.array([query_embedding]).astype('float32')
        distances, indices = self.index.search(vector, k)
        
        results = []
        for idx in indices[0]:
            if idx != -1 and idx < len(self.chunks):
                results.append(self.chunks[idx])
        return results

# Singleton instance
vector_store = FAISSStore()

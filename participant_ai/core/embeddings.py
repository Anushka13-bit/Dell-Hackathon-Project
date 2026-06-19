"""Unified semantic embeddings for participants using sentence-transformers."""

import logging
from typing import List

# Use lazy loading for the model so it doesn't block fast startup
# if embedding isn't needed right away.
_MODEL = None

logger = logging.getLogger(__name__)

def _get_model():
    global _MODEL
    if _MODEL is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading sentence-transformers model...")
            _MODEL = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Model loaded successfully.")
        except ImportError:
            logger.warning("sentence-transformers not installed. Returning dummy embeddings.")
            return None
    return _MODEL

def generate_embedding(text: str) -> List[float]:
    """Generate a 384-dimensional dense vector for the given text."""
    if not text or not text.strip():
        # Return empty 384-dim vector
        return [0.0] * 384
        
    model = _get_model()
    if model is None:
        # Fallback for systems without torch/sentence-transformers
        return [0.0] * 384
        
    embedding = model.encode(text)
    return embedding.tolist()

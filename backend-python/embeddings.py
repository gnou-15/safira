"""
embeddings.py — Lightweight Vector Embedding Service for SAFIRA

Uses FastEmbed (ONNX Runtime) to generate 384-dimensional embeddings matching
sentence-transformers/all-MiniLM-L6-v2 without PyTorch.
Peak RAM usage is ~80MB, keeping total container memory well under Render's 512MB limit.
The model is loaded lazily on first use to ensure instant server startup.
"""

from typing import List, Tuple, Any, Optional

_embedding_model: Optional[Any] = None
_embedding_type: Optional[str] = None


def get_embedding_model() -> Tuple[Any, Optional[str]]:
    """
    Lazily loads the embedding model on first use.
    Tries FastEmbed first (ultra-lightweight, ONNX CPU quantized).
    Falls back to sentence_transformers if available.
    """
    global _embedding_model, _embedding_type
    if _embedding_model is not None:
        return _embedding_model, _embedding_type

    try:
        from fastembed import TextEmbedding
        _embedding_model = TextEmbedding("sentence-transformers/all-MiniLM-L6-v2")
        _embedding_type = "fastembed"
    except Exception as e1:
        try:
            from fastembed import TextEmbedding
            _embedding_model = TextEmbedding("BAAI/bge-small-en-v1.5")
            _embedding_type = "fastembed"
        except Exception as e2:
            try:
                from sentence_transformers import SentenceTransformer
                _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
                _embedding_type = "sentence_transformers"
            except Exception:
                _embedding_model = None
                _embedding_type = None

    return _embedding_model, _embedding_type


def get_embedding_vector(text: str) -> List[float]:
    """
    Generates a 384-dimensional embedding vector for a given text.
    Returns an empty list if no embedding model could be loaded.
    """
    model, model_type = get_embedding_model()
    if not model:
        return []
    if model_type == "fastembed":
        return list(model.embed([text]))[0].tolist()
    else:
        return model.encode(text).tolist()

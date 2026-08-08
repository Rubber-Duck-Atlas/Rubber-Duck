from __future__ import annotations

import argparse
import hashlib
import json
import math
import pickle
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

import numpy as np
from bs4 import BeautifulSoup
from pypdf import PdfReader

try:
    import docx
    DOCX_IMPORT_ERROR = None
except Exception as exc:
    docx = None
    DOCX_IMPORT_ERROR = exc

# Placeholder until the application has real user accounts.
DEFAULT_USER_ID = "placeholder-user"

# File types the search engine knows how to read.
SUPPORTED_EXTENSIONS = (".pdf", ".html", ".htm", ".docx", ".txt")

# Where extracted text is cached so re-indexing a large library doesn't
# require re-reading every file from scratch on each run.
DEFAULT_CACHE_PATH = Path(__file__).resolve().parent / ".rubber_duck_cache.pkl"

# Local sentence-transformers model used for embedding-based semantic search.
DEFAULT_EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Where chunk embeddings are cached so a large library isn't re-embedded on every run.
DEFAULT_EMBEDDING_CACHE_PATH = Path(__file__).resolve().parent / ".rubber_duck_embeddings.pkl"

# Local LLM served by Ollama (https://ollama.com), used to synthesize answers
# grounded in the retrieved chunks.
DEFAULT_OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_LLM_MODEL = "llama3.2"


# Clean up whitespace so extracted PDF text is easier to search.
# Also strips lone UTF-16 surrogates that some malformed PDFs produce, which
# would otherwise crash UTF-8 encoding later (e.g. during embedding/hashing).
def normalize_text(text: str) -> str:
    text = (text or "").encode("utf-8", errors="ignore").decode("utf-8", errors="ignore")
    return re.sub(r"\s+", " ", text).strip()


# Read the text from a single PDF file so it can be indexed and searched.
def extract_text_from_pdf(pdf_path: Path) -> str:
    try:
        reader = PdfReader(str(pdf_path))
        pages = [page.extract_text() or "" for page in reader.pages]
        return normalize_text(" ".join(pages))
    except Exception as exc:
        print(f"Warning: could not read {pdf_path.name}: {exc}")
        return ""


# Read the visible text from a single HTML file so it can be indexed and searched.
def extract_text_from_html(html_path: Path) -> str:
    try:
        raw_html = html_path.read_text(encoding="utf-8", errors="ignore")
        soup = BeautifulSoup(raw_html, "html.parser")
        return normalize_text(soup.get_text(separator=" "))
    except Exception as exc:
        print(f"Warning: could not read {html_path.name}: {exc}")
        return ""


# Read the paragraph text from a single DOCX file so it can be indexed and searched.
def extract_text_from_docx(docx_path: Path) -> str:
    if docx is None:
        print(
            "Warning: python-docx/lxml is unavailable; skipping "
            f"{docx_path.name}: {DOCX_IMPORT_ERROR}"
        )
        return ""
    try:
        document = docx.Document(str(docx_path))
        paragraphs = [paragraph.text for paragraph in document.paragraphs]
        return normalize_text(" ".join(paragraphs))
    except Exception as exc:
        print(f"Warning: could not read {docx_path.name}: {exc}")
        return ""


# Read the text from a single plain text file so it can be indexed and searched.
def extract_text_from_txt(txt_path: Path) -> str:
    try:
        return normalize_text(txt_path.read_text(encoding="utf-8", errors="ignore"))
    except Exception as exc:
        print(f"Warning: could not read {txt_path.name}: {exc}")
        return ""


# Pick the right extractor based on the file extension.
def extract_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return extract_text_from_pdf(path)
    if suffix in (".html", ".htm"):
        return extract_text_from_html(path)
    if suffix == ".docx":
        return extract_text_from_docx(path)
    if suffix == ".txt":
        return extract_text_from_txt(path)
    print(f"Warning: unsupported file type for {path.name}")
    return ""


# Load the cache of previously extracted document text, keyed by file path.
def load_text_cache(cache_path: Path) -> dict:
    if not cache_path.exists():
        return {}
    try:
        with cache_path.open("rb") as cache_file:
            return pickle.load(cache_file)
    except Exception as exc:
        print(f"Warning: could not read cache {cache_path.name}: {exc}")
        return {}


# Persist the extracted-text cache to disk for reuse on the next run.
def save_text_cache(cache_path: Path, cache: dict) -> None:
    try:
        with cache_path.open("wb") as cache_file:
            pickle.dump(cache, cache_file)
    except Exception as exc:
        print(f"Warning: could not save cache {cache_path.name}: {exc}")


# Return a document's text, reusing the cached extraction when the file's
# size and modified time haven't changed since it was last indexed.
def get_document_text(path: Path, cache: dict) -> str:
    stat = path.stat()
    key = str(path)
    cached = cache.get(key)
    if cached and cached["mtime"] == stat.st_mtime and cached["size"] == stat.st_size:
        return cached["text"]

    text = extract_text(path)
    cache[key] = {"mtime": stat.st_mtime, "size": stat.st_size, "text": text}
    return text


# Find every supported document (PDF, HTML, DOCX) under the provided folder.
def find_document_files(root: Path) -> List[Path]:
    if not root.exists():
        return []
    return sorted(
        path
        for path in root.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )


# Break text into simple terms so keyword matching is possible.
def tokenize(text: str) -> List[str]:
    return [token for token in re.findall(r"[a-zA-Z0-9]+", text.lower()) if token]


# Split a document's text into overlapping word-based chunks so search results
# can point at a specific passage instead of an entire document.
def chunk_text(text: str, chunk_size: int = 200, overlap: int = 40) -> List[str]:
    words = text.split()
    if not words:
        return []
    if len(words) <= chunk_size:
        return [text]

    step = max(1, chunk_size - overlap)
    chunks: List[str] = []
    for start in range(0, len(words), step):
        chunk_words = words[start:start + chunk_size]
        if not chunk_words:
            break
        chunks.append(" ".join(chunk_words))
        if start + chunk_size >= len(words):
            break
    return chunks


# Build a searchable index from all supported documents in the folder. Each
# document is split into chunks, and every chunk carries metadata pointing
# back to its source file and position within that file.
def build_index(
    document_paths: List[Path],
    chunk_size: int = 200,
    chunk_overlap: int = 40,
    cache_path: Path | None = DEFAULT_CACHE_PATH,
    build_keyword_index: bool = True,
) -> Tuple[dict | None, List[dict] | None]:
    cache = load_text_cache(cache_path) if cache_path else {}

    chunks: List[dict] = []
    for document_path in document_paths:
        text = get_document_text(document_path, cache) if cache_path else extract_text(document_path)
        if not text:
            continue

        text_chunks = chunk_text(text, chunk_size=chunk_size, overlap=chunk_overlap)
        total_chunks = len(text_chunks)
        for chunk_index, chunk in enumerate(text_chunks):
            chunks.append({
                "path": document_path,
                "text": chunk,
                # Skipped when only semantic search is needed - tokenizing every
                # chunk to build the keyword index is slow for large libraries.
                "tokens": tokenize(chunk) if build_keyword_index else [],
                "metadata": {
                    "source": str(document_path),
                    "file_name": document_path.name,
                    "file_type": document_path.suffix.lower().lstrip("."),
                    "chunk_index": chunk_index,
                    "total_chunks": total_chunks,
                },
            })

    if cache_path:
        # Drop entries for files that no longer exist so the cache doesn't grow forever.
        current_keys = {str(path) for path in document_paths}
        cache = {key: value for key, value in cache.items() if key in current_keys}
        save_text_cache(cache_path, cache)

    if not chunks:
        return None, None

    index: dict = {}
    if build_keyword_index:
        for chunk in chunks:
            for token in set(chunk["tokens"]):
                index.setdefault(token, []).append(chunk["path"])
    return index, chunks


# Rank document chunks by how strongly they match the user's keyword query.
# Each result is a dict with the score, source path, matching snippet, and
# the chunk's metadata (file name, type, chunk position, etc.).
def search(query: str, index: dict | None, documents: List[dict] | None, top_k: int = 5) -> List[dict]:
    if not query.strip() or not documents:
        return []

    query_terms = tokenize(query)
    if not query_terms:
        return []

    scores: List[Tuple[float, int]] = []
    for doc_index, doc in enumerate(documents):
        doc_terms = set(doc["tokens"])
        overlap = sum(1 for term in query_terms if term in doc_terms)
        if overlap == 0:
            continue
        score = overlap / math.sqrt(len(doc_terms) + 1)
        scores.append((score, doc_index))

    ranked = sorted(scores, key=lambda item: item[0], reverse=True)[:top_k]

    results: List[dict] = []
    for score, doc_index in ranked:
        doc = documents[doc_index]
        snippet = build_snippet(doc["text"], query)
        results.append({
            "score": float(score),
            "path": doc["path"],
            "snippet": snippet,
            "text": doc["text"],
            "metadata": doc["metadata"],
        })
    return results


# Load the cache of previously computed chunk embeddings, keyed by a hash of
# the chunk's text so identical chunks are only ever embedded once.
def load_embedding_cache(cache_path: Path) -> dict:
    if not cache_path.exists():
        return {}
    try:
        with cache_path.open("rb") as cache_file:
            return pickle.load(cache_file)
    except Exception as exc:
        print(f"Warning: could not read embedding cache {cache_path.name}: {exc}")
        return {}


# Persist the embedding cache to disk for reuse on the next run.
def save_embedding_cache(cache_path: Path, cache: dict) -> None:
    try:
        with cache_path.open("wb") as cache_file:
            pickle.dump(cache, cache_file)
    except Exception as exc:
        print(f"Warning: could not save embedding cache {cache_path.name}: {exc}")


_embedding_model = None


# Lazily load the sentence-transformers model so keyword-only searches never
# pay the (slow) import/download/load cost of the embedding model.
def get_embedding_model(model_name: str = DEFAULT_EMBEDDING_MODEL):
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        print(f"Loading embedding model '{model_name}' (first run may download it)...")
        _embedding_model = SentenceTransformer(model_name)
    return _embedding_model


# Compute (or reuse cached) embeddings for every chunk, keyed by a hash of
# the chunk's text so unchanged chunks are never re-embedded.
def embed_chunks(
    documents: List[dict],
    model_name: str = DEFAULT_EMBEDDING_MODEL,
    cache_path: Path | None = DEFAULT_EMBEDDING_CACHE_PATH,
) -> np.ndarray:
    cache = load_embedding_cache(cache_path) if cache_path else {}

    keys = [hashlib.sha1(doc["text"].encode("utf-8")).hexdigest() for doc in documents]
    missing_indices = [i for i, key in enumerate(keys) if key not in cache]

    if missing_indices:
        model = get_embedding_model(model_name)
        missing_texts = [documents[i]["text"] for i in missing_indices]
        print(f"Embedding {len(missing_texts)} new/changed chunk(s)...")
        vectors = model.encode(missing_texts, batch_size=32, show_progress_bar=True, normalize_embeddings=True)
        for i, vector in zip(missing_indices, vectors):
            cache[keys[i]] = vector

    if cache_path:
        # Drop entries for chunks that no longer exist so the cache doesn't grow forever.
        used_keys = set(keys)
        cache = {key: value for key, value in cache.items() if key in used_keys}
        save_embedding_cache(cache_path, cache)

    return np.array([cache[key] for key in keys], dtype=np.float32)


# Rank document chunks by cosine similarity between the query and each
# chunk's embedding. Returns results in the same shape as search().
def semantic_search(
    query: str,
    chunk_embeddings: np.ndarray | None,
    documents: List[dict] | None,
    top_k: int = 5,
    model_name: str = DEFAULT_EMBEDDING_MODEL,
) -> List[dict]:
    if not query.strip() or not documents or chunk_embeddings is None or len(chunk_embeddings) == 0:
        return []

    model = get_embedding_model(model_name)
    query_vector = model.encode([query], normalize_embeddings=True)[0]

    scores = chunk_embeddings @ query_vector
    ranked_indices = np.argsort(scores)[::-1][:top_k]

    results: List[dict] = []
    for doc_index in ranked_indices:
        doc = documents[int(doc_index)]
        snippet = build_snippet(doc["text"], query)
        results.append({
            "score": float(scores[doc_index]),
            "path": doc["path"],
            "snippet": snippet,
            "text": doc["text"],
            "metadata": doc["metadata"],
        })
    return results


# Extract a short snippet around the matching words for easier review.
def build_snippet(text: str, query: str, window: int = 80) -> str:
    terms = [term for term in re.split(r"[^a-z0-9]+", query.lower()) if term]
    if not terms:
        return text[:window] + ("..." if len(text) > window else "")

    lower_text = text.lower()
    for term in terms:
        pos = lower_text.find(term)
        if pos != -1:
            start = max(0, pos - window)
            end = min(len(text), pos + window + len(term))
            snippet = text[start:end].replace("\n", " ")
            return snippet + ("..." if end < len(text) else "")
    return text[:window] + ("..." if len(text) > window else "")


# Build a grounded prompt instructing the LLM to answer only from the
# retrieved chunks and cite which source each part of the answer came from.
def build_answer_prompt(query: str, results: List[dict]) -> str:
    sources = "\n\n".join(
        f"[{rank}] Source: {result['metadata']['file_name']} "
        f"(chunk {result['metadata']['chunk_index'] + 1}/{result['metadata']['total_chunks']})\n"
        f"{result['text']}"
        for rank, result in enumerate(results, start=1)
    )
    return (
        "Answer the question using ONLY the information in the sources below. "
        "Write a complete answer in 1-3 full sentences; do not answer with fragments or a single term. "
        "Cite sources with their bracketed number, e.g. [1]. "
        "Include at least one citation in each sentence that states a factual claim. "
        "If the sources don't contain the answer, say so instead of guessing.\n\n"
        f"Sources:\n{sources}\n\n"
        f"Question: {query}\n"
        "Answer:"
    )


# Ask a local Ollama model to synthesize an answer grounded in the retrieved
# chunks. Requires Ollama running locally (`ollama serve`) with the model
# already pulled (`ollama pull <model>`).
def generate_answer(
    query: str,
    results: List[dict],
    model: str = DEFAULT_LLM_MODEL,
    ollama_url: str = DEFAULT_OLLAMA_URL,
) -> str:
    if not results:
        return "No relevant sources were found in the library to answer this question."

    prompt = build_answer_prompt(query, results)
    payload = json.dumps({"model": model, "prompt": prompt, "stream": False}).encode("utf-8")
    request = urllib.request.Request(
        ollama_url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            body = json.loads(response.read().decode("utf-8"))
            return body.get("response", "").strip()
    except (urllib.error.URLError, TimeoutError) as exc:
        return (
            f"Could not reach the local LLM at {ollama_url}: {exc}\n"
            f"Make sure Ollama is installed and running, and that the model is pulled "
            f"(`ollama pull {model}`)."
        )


# Build the JSON-serializable results payload for a search, including a
# placeholder user id and the timestamp of the search.
def build_results_payload(
    query: str,
    results: List[dict],
    user_id: str = DEFAULT_USER_ID,
    answer: str | None = None,
) -> dict:
    payload = {
        "user_id": user_id,
        "timestamp": datetime.now().strftime("%Y-%m-%d_%H-%M-%S"),
        "query": query,
    }
    if answer is not None:
        payload["answer"] = answer
    payload["results"] = [
            {
                "path": str(result["path"]),
                "score": round(result["score"], 3),
                "Snippet": result["snippet"],
                "metadata": result["metadata"],
            }
            for result in results
        ]
    return payload


def run_interactive_search(
    document_count: int,
    index: dict,
    documents: List[dict],
    top_k: int,
    user_id: str = DEFAULT_USER_ID,
    use_semantic: bool = False,
    chunk_embeddings: np.ndarray | None = None,
    ask: bool = False,
    llm_model: str = DEFAULT_LLM_MODEL,
) -> None:
    print(f"Indexed {len(documents)} chunk(s) from {document_count} document(s).")
    while True:
        query = input("\nEnter a keyword or phrase (blank to quit): ").strip()
        if not query:
            break
        answer = None
        if use_semantic:
            results = semantic_search(query, chunk_embeddings, documents, top_k=top_k)
        else:
            results = search(query, index, documents, top_k=top_k)
        if not results:
            print("No strong matches found.")
            continue

        print(f"\nTop {len(results)} match(es):")
        for rank, result in enumerate(results, start=1):
            chunk_position = f"{result['metadata']['chunk_index'] + 1}/{result['metadata']['total_chunks']}"
            print(f"{rank}. {result['path'].name} (score: {result['score']:.3f}, chunk {chunk_position})")
            print(f"   {result['snippet']}")

        if ask:
            print("\nGenerating answer...")
            answer = generate_answer(query, results, model=llm_model)
            print(f"\nAnswer:\n{answer}")

        payload = build_results_payload(query, results, user_id=user_id, answer=answer)
        print(json.dumps(payload, indent=4))


def main() -> None:
    parser = argparse.ArgumentParser(description="Search keyword content inside PDF, HTML, DOCX, and TXT files")
    parser.add_argument("--data-dir", default=str(Path(__file__).resolve().parent / "Notes_Data"), help="Folder containing PDF, HTML, DOCX, and TXT files")
    parser.add_argument("--query", default="", help="Keyword or phrase to search")
    parser.add_argument("--top-k", type=int, default=5, help="Number of matches to return")
    parser.add_argument("--interactive", action="store_true", help="Run the search engine interactively")
    parser.add_argument("--user-id", default=DEFAULT_USER_ID, help="Placeholder user identifier included in the JSON output")
    parser.add_argument("--chunk-size", type=int, default=200, help="Number of words per chunk")
    parser.add_argument("--chunk-overlap", type=int, default=40, help="Number of overlapping words between consecutive chunks")
    parser.add_argument("--no-cache", action="store_true", help="Disable the on-disk text extraction cache")
    parser.add_argument("--rebuild-cache", action="store_true", help="Ignore any existing cache and re-extract every document")
    parser.add_argument("--semantic", action="store_true", help="Use embedding-based semantic search instead of keyword search")
    parser.add_argument("--ask", action="store_true", help="Answer the query with a local LLM grounded in retrieved chunks (implies --semantic)")
    parser.add_argument("--llm-model", default=DEFAULT_LLM_MODEL, help="Ollama model name to use with --ask")
    args = parser.parse_args()

    data_dir = Path(args.data_dir).resolve()
    document_paths = find_document_files(data_dir)
    if not document_paths:
        print(f"No PDF, HTML, DOCX, or TXT files were found in {data_dir}.")
        return

    cache_path = None if args.no_cache else DEFAULT_CACHE_PATH
    if args.rebuild_cache and cache_path and cache_path.exists():
        cache_path.unlink()

    use_semantic = args.semantic or args.ask
    print(f"Scanning {len(document_paths)} document(s) in {data_dir}...")
    index, documents = build_index(
        document_paths,
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
        cache_path=cache_path,
        build_keyword_index=not use_semantic,
    )
    if index is None or documents is None:
        print("No searchable text was extracted from the documents.")
        return

    chunk_embeddings = None
    if use_semantic:
        embedding_cache_path = None if args.no_cache else DEFAULT_EMBEDDING_CACHE_PATH
        chunk_embeddings = embed_chunks(documents, cache_path=embedding_cache_path)

    if args.interactive:
        run_interactive_search(
            len(document_paths),
            index,
            documents,
            args.top_k,
            user_id=args.user_id,
            use_semantic=use_semantic,
            chunk_embeddings=chunk_embeddings,
            ask=args.ask,
            llm_model=args.llm_model,
        )
        return

    if not args.query.strip():
        print("Provide a query with --query or run in interactive mode with --interactive.")
        return

    results = semantic_search(args.query, chunk_embeddings, documents, top_k=args.top_k) if use_semantic else search(args.query, index, documents, top_k=args.top_k)
    if not results:
        print("No strong matches found.")
        return

    answer = None

    print(f"Top {len(results)} match(es) for '{args.query}':")
    for rank, result in enumerate(results, start=1):
        chunk_position = f"{result['metadata']['chunk_index'] + 1}/{result['metadata']['total_chunks']}"
        print(f"{rank}. {result['path']} (score: {result['score']:.3f}, chunk {chunk_position})")
        print(f"   {result['snippet']}")

    if args.ask:
        print("\nGenerating answer...")
        answer = generate_answer(args.query, results, model=args.llm_model)
        print(f"\nAnswer:\n{answer}")

    payload = build_results_payload(args.query, results, user_id=args.user_id, answer=answer)
    print(json.dumps(payload, indent=4))


if __name__ == "__main__":
    # Documents often contain non-ASCII symbols (math, accents); force UTF-8
    # output so redirecting stdout to a file doesn't crash on Windows' default
    # console codepage.
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    main()

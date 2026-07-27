from __future__ import annotations

import argparse
import json
import math
import re
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

import docx
from bs4 import BeautifulSoup
from pypdf import PdfReader

# Placeholder until the application has real user accounts.
DEFAULT_USER_ID = "placeholder-user"

# File types the search engine knows how to read.
SUPPORTED_EXTENSIONS = (".pdf", ".html", ".htm", ".docx", ".txt")


# Clean up whitespace so extracted PDF text is easier to search.
def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


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
) -> Tuple[dict | None, List[dict] | None]:
    chunks: List[dict] = []
    for document_path in document_paths:
        text = extract_text(document_path)
        if not text:
            continue

        text_chunks = chunk_text(text, chunk_size=chunk_size, overlap=chunk_overlap)
        total_chunks = len(text_chunks)
        for chunk_index, chunk in enumerate(text_chunks):
            chunks.append({
                "path": document_path,
                "text": chunk,
                "tokens": tokenize(chunk),
                "metadata": {
                    "source": str(document_path),
                    "file_name": document_path.name,
                    "file_type": document_path.suffix.lower().lstrip("."),
                    "chunk_index": chunk_index,
                    "total_chunks": total_chunks,
                },
            })

    if not chunks:
        return None, None

    index: dict = {}
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


# Save search results to a timestamped JSON file inside the Results folder.
def save_results_json(
    query: str,
    results: List[dict],
    output_dir: Path | str = "Results",
    user_id: str = DEFAULT_USER_ID,
) -> Path:
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    output_path = output_dir / f"{user_id}_{timestamp}.json"

    payload = {
        "query": query,
        "results": [
            {
                "path": str(result["path"]),
                "score": round(result["score"], 3),
                "Snippet": result["snippet"],
                "metadata": result["metadata"],
            }
            for result in results
        ],
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=4)

    return output_path


def run_interactive_search(data_dir: Path, top_k: int, chunk_size: int = 200, chunk_overlap: int = 40) -> None:
    print(f"Scanning documents in {data_dir}...")
    document_paths = find_document_files(data_dir)
    if not document_paths:
        print("No PDF, HTML, DOCX, or TXT files were found. Place documents in the Notes_Data folder and try again.")
        return

    index, documents = build_index(document_paths, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    if index is None or documents is None:
        print("No searchable text was extracted from the documents.")
        return

    print(f"Indexed {len(documents)} chunk(s) from {len(document_paths)} document(s).")
    while True:
        query = input("\nEnter a keyword or phrase (blank to quit): ").strip()
        if not query:
            break
        results = search(query, index, documents, top_k=top_k)
        if not results:
            print("No strong matches found.")
            continue

        print(f"\nTop {len(results)} match(es):")
        for rank, result in enumerate(results, start=1):
            chunk_position = f"{result['metadata']['chunk_index'] + 1}/{result['metadata']['total_chunks']}"
            print(f"{rank}. {result['path'].name} (score: {result['score']:.3f}, chunk {chunk_position})")
            print(f"   {result['snippet']}")

        saved_path = save_results_json(query, results)
        print(f"Saved results to {saved_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Search keyword content inside PDF, HTML, DOCX, and TXT files")
    parser.add_argument("--data-dir", default=str(Path(__file__).resolve().parent / "Notes_Data"), help="Folder containing PDF, HTML, DOCX, and TXT files")
    parser.add_argument("--query", default="", help="Keyword or phrase to search")
    parser.add_argument("--top-k", type=int, default=5, help="Number of matches to return")
    parser.add_argument("--interactive", action="store_true", help="Run the search engine interactively")
    parser.add_argument("--user-id", default=DEFAULT_USER_ID, help="Placeholder user identifier used in the saved results filename")
    parser.add_argument("--output-dir", default="Results", help="Folder where search result JSON files are saved")
    parser.add_argument("--chunk-size", type=int, default=200, help="Number of words per chunk")
    parser.add_argument("--chunk-overlap", type=int, default=40, help="Number of overlapping words between consecutive chunks")
    args = parser.parse_args()

    data_dir = Path(args.data_dir).resolve()
    document_paths = find_document_files(data_dir)
    if not document_paths:
        print(f"No PDF, HTML, DOCX, or TXT files were found in {data_dir}.")
        return

    index, documents = build_index(document_paths, chunk_size=args.chunk_size, chunk_overlap=args.chunk_overlap)
    if index is None or documents is None:
        print("No searchable text was extracted from the documents.")
        return

    if args.interactive:
        run_interactive_search(data_dir, args.top_k, chunk_size=args.chunk_size, chunk_overlap=args.chunk_overlap)
        return

    if not args.query.strip():
        print("Provide a query with --query or run in interactive mode with --interactive.")
        return

    results = search(args.query, index, documents, top_k=args.top_k)
    if not results:
        print("No strong matches found.")
        return

    print(f"Top {len(results)} match(es) for '{args.query}':")
    for rank, result in enumerate(results, start=1):
        chunk_position = f"{result['metadata']['chunk_index'] + 1}/{result['metadata']['total_chunks']}"
        print(f"{rank}. {result['path']} (score: {result['score']:.3f}, chunk {chunk_position})")
        print(f"   {result['snippet']}")

    saved_path = save_results_json(args.query, results, output_dir=args.output_dir, user_id=args.user_id)
    print(f"Saved results to {saved_path}")


if __name__ == "__main__":
    main()

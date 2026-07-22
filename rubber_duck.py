from __future__ import annotations

import argparse
import json
import math
import re
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

from pypdf import PdfReader

# Placeholder until the application has real user accounts.
DEFAULT_USER_ID = "placeholder-user"


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


# Find every PDF file under the provided folder.
def find_pdf_files(root: Path) -> List[Path]:
    if not root.exists():
        return []
    return sorted(path for path in root.rglob("*.pdf") if path.is_file())


# Break text into simple terms so keyword matching is possible.
def tokenize(text: str) -> List[str]:
    return [token for token in re.findall(r"[a-zA-Z0-9]+", text.lower()) if token]


# Build a searchable index from all PDFs in the folder.
def build_index(pdf_paths: List[Path]) -> Tuple[dict | None, List[dict] | None]:
    documents: List[dict] = []
    for pdf_path in pdf_paths:
        text = extract_text_from_pdf(pdf_path)
        if text:
            documents.append({"path": pdf_path, "text": text, "tokens": tokenize(text)})

    if not documents:
        return None, None

    index = {}
    for doc in documents:
        for token in set(doc["tokens"]):
            index.setdefault(token, []).append(doc["path"])
    return index, documents


# Rank PDFs by how strongly they match the user's keyword query.
def search(query: str, index: dict | None, documents: List[dict] | None, top_k: int = 5) -> List[Tuple[float, Path, str]]:
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

    results: List[Tuple[float, Path, str]] = []
    for score, doc_index in ranked:
        doc = documents[doc_index]
        snippet = build_snippet(doc["text"], query)
        results.append((float(score), doc["path"], snippet))
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
    results: List[Tuple[float, Path, str]],
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
                "path": str(path),
                "score": round(score, 3),
                "Snippet": snippet,
            }
            for score, path, snippet in results
        ],
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=4)

    return output_path


def run_interactive_search(data_dir: Path, top_k: int) -> None:
    print(f"Scanning PDFs in {data_dir}...")
    pdf_paths = find_pdf_files(data_dir)
    if not pdf_paths:
        print("No PDF files were found. Place PDF files in the Notes_Data folder and try again.")
        return

    index, documents = build_index(pdf_paths)
    if index is None or documents is None:
        print("No searchable text was extracted from the PDFs.")
        return

    print(f"Indexed {len(documents)} document(s).")
    while True:
        query = input("\nEnter a keyword or phrase (blank to quit): ").strip()
        if not query:
            break
        results = search(query, index, documents, top_k=top_k)
        if not results:
            print("No strong matches found.")
            continue

        print(f"\nTop {len(results)} match(es):")
        for rank, (score, path, snippet) in enumerate(results, start=1):
            print(f"{rank}. {path.name} (score: {score:.3f})")
            print(f"   {snippet}")

        saved_path = save_results_json(query, results)
        print(f"Saved results to {saved_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Search keyword content inside PDF files")
    parser.add_argument("--data-dir", default=str(Path(__file__).resolve().parent / "Notes_Data"), help="Folder containing PDF files")
    parser.add_argument("--query", default="", help="Keyword or phrase to search")
    parser.add_argument("--top-k", type=int, default=5, help="Number of matches to return")
    parser.add_argument("--interactive", action="store_true", help="Run the search engine interactively")
    parser.add_argument("--user-id", default=DEFAULT_USER_ID, help="Placeholder user identifier used in the saved results filename")
    parser.add_argument("--output-dir", default="Results", help="Folder where search result JSON files are saved")
    args = parser.parse_args()

    data_dir = Path(args.data_dir).resolve()
    pdf_paths = find_pdf_files(data_dir)
    if not pdf_paths:
        print(f"No PDF files were found in {data_dir}.")
        return

    index, documents = build_index(pdf_paths)
    if index is None or documents is None:
        print("No searchable text was extracted from the PDFs.")
        return

    if args.interactive:
        run_interactive_search(data_dir, args.top_k)
        return

    if not args.query.strip():
        print("Provide a query with --query or run in interactive mode with --interactive.")
        return

    results = search(args.query, index, documents, top_k=args.top_k)
    if not results:
        print("No strong matches found.")
        return

    print(f"Top {len(results)} match(es) for '{args.query}':")
    for rank, (score, path, snippet) in enumerate(results, start=1):
        print(f"{rank}. {path} (score: {score:.3f})")
        print(f"   {snippet}")

    saved_path = save_results_json(args.query, results, output_dir=args.output_dir, user_id=args.user_id)
    print(f"Saved results to {saved_path}")


if __name__ == "__main__":
    main()

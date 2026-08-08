# Rubber Duck document search engine

This workspace includes a document search tool that scans PDF, HTML, DOCX, and TXT files in the Notes_Data folder, chunks and indexes them, and returns the best matches for a keyword or phrase. It can also run fully local semantic search and question answering using sentence-transformer embeddings and an Ollama LLM.

## What each part does

- rubber_duck.py: the main search script. Extracts text from PDF/HTML/DOCX/TXT files, splits it into overlapping chunks with metadata, and supports keyword search, embedding-based semantic search, and LLM-generated answers.
- Rubber_Duck.ipynb: a notebook version of the same workflow with a results table and clickable document links.
- test_rubber_duck.py: regression tests for chunking, metadata, and keyword search.

## Install dependencies

```bash
pip install -r requirements.txt
```

Semantic search and answer generation also require:
- [Ollama](https://ollama.com/download) installed and running locally, with a model pulled (e.g. `ollama pull llama3.2`).

### Optional: GPU-accelerated embeddings

`requirements.txt` installs the CPU-only build of `torch` by default, which works everywhere but is slow for embedding large libraries. If you have an NVIDIA GPU, install a CUDA-enabled build instead for a large speedup (embedding a ~1,850-file library went from ~8 hours on CPU to ~20 minutes on an RTX 4060):

```bash
pip uninstall -y torch
pip install torch --index-url https://download.pytorch.org/whl/cu124
```

Verify it's working:

```bash
python -c "import torch; print(torch.cuda.is_available())"
```

`sentence-transformers` automatically uses the GPU when available, no code changes needed.

## Run a one-off keyword search

```bash
python rubber_duck.py --data-dir Notes_Data --query "machine learning"
```

## Run interactive search

```bash
python rubber_duck.py --data-dir Notes_Data --interactive
```

## Run semantic search

Uses sentence-transformer embeddings and cosine similarity instead of keyword overlap:

```bash
python rubber_duck.py --data-dir Notes_Data --query "how does backpropagation work" --semantic
```

## Ask a question (local RAG)

Retrieves the most relevant chunks and asks a local Ollama model to answer using only that content, with citations:

```bash
python rubber_duck.py --data-dir Notes_Data --query "how does backpropagation work" --ask
```

`--ask` automatically enables semantic retrieval. Use `--llm-model` to pick a different Ollama model (default: `llama3.2`).

## CLI arguments

| Argument | Default | Description |
| --- | --- | --- |
| `--data-dir` | `Notes_Data` | Folder containing PDF, HTML, DOCX, and TXT files |
| `--query` | (none) | Keyword or phrase to search |
| `--top-k` | `5` | Number of matches to return |
| `--interactive` | off | Run the search engine interactively |
| `--user-id` | `placeholder-user` | Placeholder user identifier included in the JSON output |
| `--chunk-size` | `200` | Number of words per chunk |
| `--chunk-overlap` | `40` | Number of overlapping words between consecutive chunks |
| `--no-cache` | off | Disable the on-disk text extraction cache |
| `--rebuild-cache` | off | Ignore any existing cache and re-extract every document |
| `--semantic` | off | Use embedding-based semantic search instead of keyword search |
| `--ask` | off | Answer the query with a local LLM grounded in retrieved chunks (implies `--semantic`) |
| `--llm-model` | `llama3.2` | Ollama model name to use with `--ask` |

## Caching

Two on-disk caches speed up repeated runs against a large library, keyed by each file/chunk's content so unchanged data is never reprocessed:

- `.rubber_duck_cache.pkl`: extracted document text (keyed by file path, size, and modified time).
- `.rubber_duck_embeddings.pkl`: chunk embeddings (keyed by a hash of the chunk's text).

Both are ignored by git. Use `--no-cache` to disable caching, or `--rebuild-cache` to force a fresh text extraction.

## Output format

Search results are printed as JSON to stdout, including a placeholder user id, a timestamp, the query, and each result's path, score, snippet, and metadata (file name, file type, chunk position). When `--ask` is enabled, the JSON also includes an `answer` field between `query` and `results`.

## Run the regression tests

```bash
python -m unittest test_rubber_duck.py
```

Drop your documents into the Notes_Data folder and start searching.


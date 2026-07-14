# PDF keyword search engine

This workspace includes a lightweight PDF search tool that scans PDF files in the Notes_Data folder and returns the best matches for a keyword or phrase.

## What each part does

- rubber_duck.py: the main search script that reads PDFs, builds a simple keyword index, and returns matching results.
- Rubber_Duck.ipynb: a notebook version of the same workflow with a small HTML table and clickable PDF links.
- test_rubber_duck.py: a small regression test that creates a sample PDF and checks that a keyword search can find it.

## Install dependencies

```bash
pip install -r requirements.txt
```

## Run a one-off search

```bash
python rubber_duck.py --data-dir Notes_Data --query "machine learning"
```

## Run interactive search

```bash
python rubber_duck.py --data-dir Notes_Data --interactive
```

## Run the regression test

```bash
python -m unittest test_rubber_duck.py
```

Drop your PDFs into the Notes_Data folder and start searching.

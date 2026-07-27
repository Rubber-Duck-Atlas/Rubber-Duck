import tempfile
import unittest
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

import rubber_duck


class RubberDuckTests(unittest.TestCase):
    def test_search_finds_keyword_in_generated_pdf(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir)
            pdf_path = tmp_path / "sample.pdf"

            c = canvas.Canvas(str(pdf_path))
            c.setFont("Helvetica", 12)
            c.drawString(100, 750, "This document discusses machine learning and neural networks.")
            c.save()

            pdf_paths = [pdf_path]
            _, documents = rubber_duck.build_index(pdf_paths)
            self.assertIsNotNone(documents)

            results = rubber_duck.search("machine learning", None, documents, top_k=3)
            self.assertTrue(results)
            self.assertIn(pdf_path.name, results[0]["path"].name)
            self.assertIn("chunk_index", results[0]["metadata"])
            self.assertIn("total_chunks", results[0]["metadata"])
            self.assertEqual(results[0]["metadata"]["file_type"], "pdf")

    def test_chunk_text_splits_long_text_with_overlap(self):
        words = [f"word{i}" for i in range(500)]
        text = " ".join(words)

        chunks = rubber_duck.chunk_text(text, chunk_size=200, overlap=40)

        self.assertGreater(len(chunks), 1)
        # Each chunk should have no more than chunk_size words.
        for chunk in chunks:
            self.assertLessEqual(len(chunk.split()), 200)
        # The overlap region should repeat between consecutive chunks.
        first_chunk_words = chunks[0].split()
        second_chunk_words = chunks[1].split()
        self.assertEqual(first_chunk_words[-40:], second_chunk_words[:40])

    def test_build_index_attaches_chunk_metadata(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir)
            txt_path = tmp_path / "notes.txt"
            txt_path.write_text(" ".join(f"word{i}" for i in range(500)), encoding="utf-8")

            index, documents = rubber_duck.build_index([txt_path], chunk_size=200, chunk_overlap=40)
            self.assertIsNotNone(documents)
            assert documents is not None
            self.assertGreater(len(documents), 1)

            for chunk_index, chunk in enumerate(documents):
                self.assertEqual(chunk["metadata"]["chunk_index"], chunk_index)
                self.assertEqual(chunk["metadata"]["total_chunks"], len(documents))
                self.assertEqual(chunk["metadata"]["file_name"], txt_path.name)
                self.assertEqual(chunk["metadata"]["file_type"], "txt")
                self.assertEqual(chunk["metadata"]["source"], str(txt_path))


if __name__ == "__main__":
    unittest.main()

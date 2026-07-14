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
            self.assertIn(pdf_path.name, results[0][1].name)


if __name__ == "__main__":
    unittest.main()

#!/usr/bin/env python3
"""Validate every deployable documentation artifact and manifest link."""

import json
import sys
from pathlib import Path

from docx import Document
from pypdf import PdfReader


def main():
    repo = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    public = repo / "apps/web/public"
    index_path = public / "documentation/library/index.json"
    index = json.loads(index_path.read_text(encoding="utf-8"))
    documents = index["documents"]
    assert index["documentCount"] == len(documents) == 639
    seen = set()
    page_count = 0
    for number, record in enumerate(documents, 1):
        assert record["id"] not in seen, f"duplicate id: {record['id']}"
        seen.add(record["id"])
        paths = {}
        for kind in ("markdown", "docx", "pdf"):
            path = public / record[f"{kind}Url"].lstrip("/")
            assert path.is_file() and path.stat().st_size > 0, f"missing {kind}: {path}"
            paths[kind] = path
        markdown = paths["markdown"].read_text(encoding="utf-8")
        assert markdown.startswith("---\n") and f"# {record['title']}" in markdown
        word = Document(paths["docx"])
        assert len(word.paragraphs) > 0 and any(p.text.strip() for p in word.paragraphs)
        pdf = PdfReader(paths["pdf"])
        assert len(pdf.pages) >= 1
        page_count += len(pdf.pages)
        if number % 100 == 0:
            print(f"validated {number}/{len(documents)}")
    expected = {".md": 639, ".docx": 639, ".pdf": 639}
    files_root = public / "documentation/library/files"
    for suffix, count in expected.items():
        actual = len(list(files_root.rglob(f"*{suffix}")))
        assert actual == count, f"expected {count} {suffix} files, found {actual}"
    print(f"validated {len(documents)} documents, {len(documents) * 3} formats, {page_count} PDF pages")


if __name__ == "__main__":
    main()

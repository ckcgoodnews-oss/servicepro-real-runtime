#!/usr/bin/env python3
"""Build the complete deployable ServicePro documentation library."""

from __future__ import annotations

import argparse
import json
import re
import zipfile
from pathlib import Path, PurePosixPath

from publish_document_library import (
    build_architecture_diagram,
    build_docx,
    build_pdf,
    clean_inline,
    polished_markdown,
)


ARCHIVE_ADDITIONS = {
    "docs/missing-service-image-prompts.md",
    "docs/MONOREPO-AUDIT-REPORT.md",
}


def extract_archive_additions(archive: Path, repo: Path):
    if not archive.exists():
        return []
    added = []
    with zipfile.ZipFile(archive) as bundle:
        names = set(bundle.namelist())
        for name in sorted(ARCHIVE_ADDITIONS):
            target = repo / PurePosixPath(name)
            if not target.exists() and name in names:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(bundle.read(name))
                added.append(target)
    return added


def metadata(source: Path, docs_root: Path):
    text = source.read_text(encoding="utf-8-sig")
    headings = re.findall(r"^#{1,6}\s+(.+)$", text, re.MULTILINE)
    title = clean_inline(headings[0]) if headings else source.stem.replace("-", " ").title()
    subtitle = clean_inline(headings[1]) if len(headings) > 1 else "ServicePro product and operations documentation"
    paragraphs = [clean_inline(p.replace("\n", " ")) for p in re.split(r"\n\s*\n", text) if p.strip() and not p.lstrip().startswith(("#", "|", "```", "---"))]
    summary = next((p for p in paragraphs if len(p) > 35), subtitle)
    relative = source.relative_to(docs_root).as_posix()
    name = source.name.lower()
    if name.startswith("sprint"):
        category = "Sprint documentation"
    elif name.startswith("phase"):
        category = "Phase documentation"
    elif relative.startswith("release/"):
        category = "Release documentation"
    elif relative.startswith("user-guides/"):
        category = "User guides"
    elif relative.startswith("engineering/"):
        category = "Engineering"
    elif relative.startswith("sales/"):
        category = "Platform overview"
    elif relative.startswith("product/"):
        category = "Product"
    else:
        category = "Operations and reference"
    document_type = category.rstrip("s")
    words = len(re.findall(r"\b\w+\b", text))
    return {
        "text": text,
        "relative": relative,
        "title": title,
        "subtitle": subtitle,
        "summary": summary[:280],
        "category": category,
        "documentType": document_type,
        "readMinutes": max(1, round(words / 220)),
        "headings": len(headings),
        "words": words,
    }


def build_one(item, output_root: Path, markdown_only: bool = False):
    relative = Path(item["relative"])
    target_dir = output_root / relative.parent
    target_dir.mkdir(parents=True, exist_ok=True)
    stem = relative.stem
    md_path = target_dir / f"{stem}.md"
    docx_path = target_dir / f"{stem}.docx"
    pdf_path = target_dir / f"{stem}.pdf"
    if relative.as_posix() == "sales/SERVICEPRO-ENTERPRISE-PLATFORM.md":
        build_architecture_diagram(target_dir / "servicepro-platform-architecture.png")
    md_path.write_text(polished_markdown(item["text"], item["title"], item["subtitle"], item["documentType"]), encoding="utf-8")
    if not markdown_only:
        build_docx(item["text"], docx_path, item["title"], item["subtitle"], item["documentType"])
        build_pdf(item["text"], pdf_path, item["title"], item["subtitle"], item["documentType"])
    public_base = "/documentation/library/files/" + relative.with_suffix("").as_posix()
    return {
        "id": relative.with_suffix("").as_posix(),
        "sourcePath": "docs/" + item["relative"],
        "title": item["title"],
        "subtitle": item["subtitle"],
        "summary": item["summary"],
        "category": item["category"],
        "readMinutes": item["readMinutes"],
        "headings": item["headings"],
        "words": item["words"],
        "markdownUrl": public_base + ".md",
        "docxUrl": public_base + ".docx",
        "pdfUrl": public_base + ".pdf",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--markdown-only", action="store_true")
    args = parser.parse_args()
    repo = args.repo.resolve()
    if args.archive:
        extract_archive_additions(args.archive, repo)
    docs_root = repo / "docs"
    output_root = repo / "apps/web/public/documentation/library/files"
    index_path = repo / "apps/web/public/documentation/library/index.json"
    sources = sorted(docs_root.rglob("*.md"), key=lambda p: p.relative_to(docs_root).as_posix().lower())
    records = []
    for number, source in enumerate(sources, 1):
        item = metadata(source, docs_root)
        records.append(build_one(item, output_root, args.markdown_only))
        if number % 50 == 0 or number == len(sources):
            print(f"published {number}/{len(sources)}")
    index_path.parent.mkdir(parents=True, exist_ok=True)
    categories = {}
    for record in records:
        categories[record["category"]] = categories.get(record["category"], 0) + 1
    index_path.write_text(json.dumps({
        "version": 1,
        "documentCount": len(records),
        "categories": categories,
        "documents": records,
    }, indent=2), encoding="utf-8")
    print(index_path)


if __name__ == "__main__":
    main()

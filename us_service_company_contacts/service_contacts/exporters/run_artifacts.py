"""Failure and run-summary artifacts for reproducible pipeline runs."""

import csv
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

FAILED_COLUMNS = ["provider", "state", "category", "error_type", "error", "failed_at"]


def export_failed_records(records: list[dict[str, str]], output: Path) -> Path:
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8-sig") as stream:
        writer = csv.DictWriter(stream, fieldnames=FAILED_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)
    return output


def export_run_summary(summary: dict[str, Any], output: Path) -> Path:
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = {"generated_at": datetime.now(UTC).isoformat(), **summary}
    output.write_text(json.dumps(payload, indent=2, default=str) + "\n", encoding="utf-8")
    return output

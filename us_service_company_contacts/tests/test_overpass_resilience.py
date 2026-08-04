"""Tests for Overpass fallback and pipeline artifacts."""

import csv
import json
from pathlib import Path
from unittest.mock import Mock

import requests

from service_contacts.exporters.run_artifacts import export_failed_records, export_run_summary
from service_contacts.providers.overpass import OverpassProvider


def test_overpass_falls_back_to_next_endpoint(monkeypatch):
    provider = OverpassProvider(timeout=17, endpoints=["https://primary.test", "https://fallback.test"])
    response = Mock()
    response.json.return_value = {"elements": []}
    attempted: list[str] = []

    def fake_post(endpoint: str, query: str):
        attempted.append(endpoint)
        if endpoint == "https://primary.test":
            raise requests.Timeout("primary timed out")
        assert "[timeout:90]" in query
        return response

    monkeypatch.setattr(provider, "_post_query", fake_post)
    records = provider._query_overpass("IN", (37.7, -88.1, 41.8, -84.7), "plumbing", [("craft", "plumber")], 10)

    assert records == []
    assert attempted == ["https://primary.test", "https://fallback.test"]
    assert provider.timeout == 17


def test_collect_records_failed_query_without_stopping(monkeypatch):
    provider = OverpassProvider(endpoints=["https://primary.test"])
    monkeypatch.setattr(provider, "_query_overpass", Mock(side_effect=RuntimeError("all endpoints failed")))

    assert list(provider.collect(["IN"], ["plumbing"], 10)) == []
    assert provider.failures[0]["provider"] == "openstreetmap_overpass"
    assert provider.failures[0]["state"] == "IN"
    assert provider.failures[0]["category"] == "plumbing"
    assert provider.failures[0]["error_type"] == "RuntimeError"


def test_run_artifacts_are_machine_readable(tmp_path: Path):
    failed_path = export_failed_records(
        [{"provider": "overpass", "state": "IN", "category": "hvac", "error": "timeout"}],
        tmp_path / "failed_records.csv",
    )
    with failed_path.open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    assert rows[0]["provider"] == "overpass"
    assert rows[0]["error"] == "timeout"

    summary_path = export_run_summary({"status": "completed", "counts": {"exported": 3}}, tmp_path / "run_summary.json")
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    assert summary["status"] == "completed"
    assert summary["counts"]["exported"] == 3
    assert summary["generated_at"].endswith("+00:00")

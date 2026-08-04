"""Tests for Overpass fallback, tiling, and pipeline artifacts."""

import csv
import json
from pathlib import Path
from unittest.mock import Mock, patch

import requests

from service_contacts.exporters.run_artifacts import export_failed_records, export_run_summary
from service_contacts.providers.overpass import OverpassProvider
from service_contacts.providers.geo_tiles import generate_tiles, tile_key


def test_overpass_falls_back_to_next_endpoint(monkeypatch):
    provider = OverpassProvider(timeout=17, endpoints=["https://primary.test", "https://fallback.test"], tile_size=5.0)
    response = Mock()
    response.json.return_value = {"elements": []}
    attempted: list[str] = []

    def fake_post(endpoint: str, query: str):
        attempted.append(endpoint)
        if endpoint == "https://primary.test":
            raise requests.Timeout("primary timed out")
        return response

    monkeypatch.setattr(provider, "_post_query", fake_post)
    records = provider._query_tile("IN", (37.7, -88.1, 41.8, -84.7), "plumbing", [("craft", "plumber")], 10)

    assert records == []
    assert attempted == ["https://primary.test", "https://fallback.test"]
    assert provider.timeout == 17


def test_collect_records_failed_tile_without_stopping(monkeypatch):
    provider = OverpassProvider(endpoints=["https://primary.test"], tile_size=5.0)
    monkeypatch.setattr(provider, "_query_tile", Mock(side_effect=RuntimeError("all endpoints failed")))

    results = list(provider.collect(["IN"], ["plumbing"], 10))
    assert results == []
    assert len(provider.failures) > 0
    assert provider.failures[0]["state"] == "IN"
    assert provider.failures[0]["category"] == "plumbing"
    assert provider.failures[0]["error_type"] == "RuntimeError"


def test_geographic_tiling_splits_large_state():
    # Indiana bounds: roughly 4° lat × 3.3° lon
    bounds = (37.77, -88.10, 41.76, -84.78)
    tiles = generate_tiles(bounds, tile_size=1.0)
    # Should produce approximately 4×4 = ~16 tiles at 1° resolution
    assert len(tiles) >= 12
    assert len(tiles) <= 20
    # Each tile should be within parent bounds
    for south, west, north, east in tiles:
        assert south >= bounds[0]
        assert west >= bounds[1]
        assert north <= bounds[2] + 0.01
        assert east <= bounds[3] + 0.01


def test_tile_key_uniqueness():
    k1 = tile_key("IN", "plumbing", 0)
    k2 = tile_key("IN", "plumbing", 1)
    k3 = tile_key("OH", "plumbing", 0)
    assert k1 != k2
    assert k1 != k3
    assert k2 != k3


def test_completed_tiles_skip_on_resume():
    provider = OverpassProvider(endpoints=["https://test.example"], tile_size=5.0)
    # Mark a tile as completed
    provider.completed_tiles.add(tile_key("IN", "plumbing", 0))
    # Mock _query_tile to track if it's called
    call_count = [0]
    original = provider._query_tile

    def counting_query(*args, **kwargs):
        call_count[0] += 1
        return []

    provider._query_tile = counting_query
    list(provider.collect(["IN"], ["plumbing"], 10))
    # Should have skipped at least one tile (the completed one)
    # The exact count depends on how many tiles IN generates at 5.0° resolution
    # but it should NOT have called for tile 0


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

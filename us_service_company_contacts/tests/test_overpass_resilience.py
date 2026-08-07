"""Tests for Overpass combined-query architecture, failover, and tiling."""

import csv
import json
from pathlib import Path
from unittest.mock import Mock

import requests

from service_contacts.exporters.run_artifacts import export_failed_records, export_run_summary
from service_contacts.providers.overpass import OverpassProvider, classify_element
from service_contacts.providers.geo_tiles import generate_tiles, tile_key
from service_contacts.categories import CATEGORIES


def test_overpass_falls_back_to_next_endpoint(monkeypatch):
    provider = OverpassProvider(timeout=17, endpoints=["https://primary.test", "https://fallback.test"], tile_size=5.0)

    call_log: list[str] = []
    original_post = provider._session.post

    def fake_post(endpoint, **kwargs):
        call_log.append(endpoint)
        if "primary.test" in endpoint:
            raise requests.Timeout("primary timed out")
        resp = Mock()
        resp.status_code = 200
        resp.json.return_value = {"elements": []}
        resp.raise_for_status = Mock()
        return resp

    monkeypatch.setattr(provider._session, "post", fake_post)
    result = provider._query_tile_combined("IN", (39.0, -86.5, 39.5, -86.0))

    assert result == []
    assert any("primary.test" in c for c in call_log)
    assert any("fallback.test" in c for c in call_log)


def test_collect_records_failed_tile_without_stopping(monkeypatch):
    provider = OverpassProvider(endpoints=["https://primary.test"], tile_size=5.0)

    def fail_query(*args, **kwargs):
        raise RuntimeError("all endpoints failed")

    monkeypatch.setattr(provider, "_query_tile_combined", fail_query)

    results = list(provider.collect(["IN"], ["plumbing"], 10))
    assert results == []
    assert len(provider.failures) > 0
    assert provider.failures[0]["state"] == "IN"


def test_classify_element_matches_correct_category():
    tags = {"craft": "plumber", "name": "Bob's Plumbing"}
    result = classify_element(tags, {"plumbing", "hvac"})
    assert result == "plumbing"

    tags_hvac = {"craft": "hvac", "name": "Cool Air"}
    result2 = classify_element(tags_hvac, {"plumbing", "hvac"})
    assert result2 == "hvac"


def test_classify_element_returns_none_for_unmatched():
    tags = {"shop": "bakery", "name": "Fresh Bread"}
    result = classify_element(tags, {"plumbing", "hvac"})
    assert result is None


def test_classify_element_respects_requested_filter():
    tags = {"craft": "plumber", "name": "Test"}
    # Only requesting hvac — plumber should not match
    result = classify_element(tags, {"hvac"})
    assert result is None


def test_geographic_tiling_splits_large_state():
    bounds = (37.77, -88.10, 41.76, -84.78)
    tiles = generate_tiles(bounds, tile_size=1.0)
    assert len(tiles) >= 12
    assert len(tiles) <= 20
    for south, west, north, east in tiles:
        assert south >= bounds[0]
        assert west >= bounds[1]


def test_tile_key_uniqueness():
    k1 = tile_key("IN", "ALL", 0)
    k2 = tile_key("IN", "ALL", 1)
    k3 = tile_key("OH", "ALL", 0)
    assert k1 != k2
    assert k1 != k3


def test_endpoint_cooldown():
    provider = OverpassProvider(endpoints=["https://ep1.test", "https://ep2.test"])
    provider._cooldown_endpoint("https://ep1.test", 60)
    ep = provider._get_available_endpoint()
    assert ep == "https://ep2.test"


def test_run_artifacts_are_machine_readable(tmp_path: Path):
    failed_path = export_failed_records(
        [{"provider": "overpass", "state": "IN", "category": "hvac", "error": "timeout"}],
        tmp_path / "failed_records.csv",
    )
    with failed_path.open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    assert rows[0]["provider"] == "overpass"

    summary_path = export_run_summary({"status": "completed", "counts": {"exported": 3}}, tmp_path / "run_summary.json")
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    assert summary["status"] == "completed"
    assert summary["counts"]["exported"] == 3

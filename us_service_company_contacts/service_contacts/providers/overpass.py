"""OpenStreetMap Overpass API provider with geographic tiling."""

import json
import logging
import random
import time
from datetime import UTC, datetime
from typing import Iterator

import requests
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from service_contacts.categories import CATEGORIES, US_STATE_BOUNDS
from service_contacts.config import (
    OVERPASS_ENDPOINT,
    OVERPASS_FALLBACK_ENDPOINTS,
    OVERPASS_TIMEOUT,
    REQUESTS_PER_SECOND,
    USER_AGENT,
)
from service_contacts.models import SourceRecord
from service_contacts.providers.base import BaseProvider
from service_contacts.providers.geo_tiles import generate_tiles, tile_key

logger = logging.getLogger("service_contacts.overpass")

# Expanded tag mappings for better coverage
EXPANDED_TAGS = {
    "plumbing": [
        ("craft", "plumber"),
        ("shop", "plumber"),
        ("office", "plumber"),
        ("service", "plumbing"),
        ("shop", "plumbing"),
    ],
    "hvac": [
        ("craft", "hvac"),
        ("craft", "heating_engineer"),
        ("shop", "hvac"),
        ("office", "hvac"),
        ("service", "hvac"),
        ("service", "air_conditioning"),
        ("service", "heating"),
        ("shop", "heating"),
    ],
}


class OverpassProvider(BaseProvider):
    """Collect business records from OpenStreetMap via Overpass API with geographic tiling."""

    name = "openstreetmap_overpass"

    def __init__(self, timeout: int | None = None, endpoints: list[str] | None = None, tile_size: float = 0.5):
        self._last_request_time = 0.0
        configured = endpoints or [OVERPASS_ENDPOINT, *OVERPASS_FALLBACK_ENDPOINTS]
        self.endpoints = list(dict.fromkeys(configured))
        self.timeout = timeout or OVERPASS_TIMEOUT
        self.tile_size = tile_size
        self.failures: list[dict] = []
        self.completed_tiles: set[str] = set()
        self._session = requests.Session()
        self._session.headers["User-Agent"] = USER_AGENT
        self._endpoint_failures: dict[str, int] = {}

    def supports_resume(self) -> bool:
        return True

    def collect(
        self,
        states: list[str],
        categories: list[str],
        limit: int = 5000,
    ) -> Iterator[SourceRecord]:
        """Query Overpass for businesses using geographic tiles."""
        count = 0
        for state in states:
            if count >= limit:
                break
            bounds = US_STATE_BOUNDS.get(state.upper())
            if not bounds:
                logger.warning(f"Unknown state: {state}")
                continue

            tiles = generate_tiles(bounds, self.tile_size)
            logger.info(f"State {state}: {len(tiles)} tiles at {self.tile_size}° resolution")

            for cat_key in categories:
                if count >= limit:
                    break
                cat = CATEGORIES.get(cat_key)
                if not cat:
                    logger.warning(f"Unknown category: {cat_key}")
                    continue

                # Use expanded tags if available, otherwise fall back to category defaults
                osm_tags = EXPANDED_TAGS.get(cat_key, cat.osm_tags)

                for tile_idx, tile_bounds in enumerate(tiles):
                    if count >= limit:
                        break

                    tkey = tile_key(state, cat_key, tile_idx)
                    if tkey in self.completed_tiles:
                        continue

                    try:
                        records = self._query_tile(state, tile_bounds, cat_key, osm_tags, min(limit - count, 200))
                        self.completed_tiles.add(tkey)
                        for record in records:
                            yield record
                            count += 1
                            if count >= limit:
                                break
                    except Exception as e:
                        logger.warning(f"Tile {tkey} failed: {e}")
                        self.failures.append({
                            "tile_key": tkey,
                            "state": state.upper(),
                            "category": cat_key,
                            "tile_index": tile_idx,
                            "bounds": f"{tile_bounds[0]:.4f},{tile_bounds[1]:.4f},{tile_bounds[2]:.4f},{tile_bounds[3]:.4f}",
                            "error_type": type(e).__name__,
                            "error": str(e)[:200],
                            "failed_at": datetime.now(UTC).isoformat(),
                        })
                        # Don't stop — continue with next tile
                        continue

        logger.info(f"Overpass collection complete: {count} records from {len(self.completed_tiles)} tiles, {len(self.failures)} failures")

    def _rate_limit(self):
        """Enforce rate limiting with jitter."""
        if REQUESTS_PER_SECOND <= 0:
            return
        min_interval = 1.0 / REQUESTS_PER_SECOND
        jitter = random.uniform(0.1, 0.5)
        elapsed = time.time() - self._last_request_time
        wait = min_interval + jitter - elapsed
        if wait > 0:
            time.sleep(wait)
        self._last_request_time = time.time()

    def _get_healthy_endpoint(self) -> str | None:
        """Get an endpoint that hasn't failed too many times recently."""
        for ep in self.endpoints:
            if self._endpoint_failures.get(ep, 0) < 5:
                return ep
        # All endpoints exhausted — reset and try again
        self._endpoint_failures.clear()
        return self.endpoints[0] if self.endpoints else None

    @retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=2, min=4, max=30),
        retry=retry_if_exception_type((requests.Timeout, requests.ConnectionError)),
    )
    def _post_query(self, endpoint: str, query: str) -> requests.Response:
        self._rate_limit()
        response = self._session.post(endpoint, data={"data": query}, timeout=self.timeout)
        if response.status_code == 429:
            retry_after = int(response.headers.get("Retry-After", "30"))
            logger.warning(f"Rate limited by {endpoint}, waiting {retry_after}s")
            time.sleep(retry_after)
            raise requests.ConnectionError("Rate limited")
        response.raise_for_status()
        return response

    def _query_tile(
        self,
        state: str,
        bounds: tuple[float, float, float, float],
        category_key: str,
        osm_tags: list[tuple[str, str]],
        max_results: int,
    ) -> list[SourceRecord]:
        """Execute a single tile query with endpoint failover."""
        bbox = f"{bounds[0]},{bounds[1]},{bounds[2]},{bounds[3]}"
        tag_filters = []
        for key, value in osm_tags:
            tag_filters.append(f'node["{key}"="{value}"]({bbox});')
            tag_filters.append(f'way["{key}"="{value}"]({bbox});')

        query = f"""[out:json][timeout:{self.timeout}];
(
  {"".join(tag_filters)}
);
out body center {max_results};"""

        # Try endpoints with failover
        last_error: Exception | None = None
        for endpoint in self.endpoints:
            if self._endpoint_failures.get(endpoint, 0) >= 5:
                continue
            try:
                response = self._post_query(endpoint, query)
                data = response.json()
                records = self._parse_elements(data.get("elements", []), state, category_key)
                if records:
                    logger.debug(f"  Tile {bbox[:20]}... → {len(records)} records via {endpoint.split('/')[2]}")
                return records
            except (requests.Timeout, requests.ConnectionError, requests.HTTPError) as exc:
                self._endpoint_failures[endpoint] = self._endpoint_failures.get(endpoint, 0) + 1
                last_error = exc
                logger.debug(f"Endpoint {endpoint.split('/')[2]} failed: {exc}")
            except Exception as exc:
                last_error = exc
                break

        if last_error:
            raise RuntimeError(f"All endpoints failed for tile {bbox}: {last_error}") from last_error
        return []

    def _parse_elements(self, elements: list, state: str, category_key: str) -> list[SourceRecord]:
        """Parse Overpass JSON elements into SourceRecords."""
        records = []
        for element in elements:
            tags = element.get("tags", {})
            name = tags.get("name", "").strip()
            if not name:
                continue

            lat = element.get("lat") or element.get("center", {}).get("lat")
            lon = element.get("lon") or element.get("center", {}).get("lon")

            record = SourceRecord(
                source_name=self.name,
                source_url=f"https://www.openstreetmap.org/{element.get('type', 'node')}/{element.get('id', '')}",
                source_record_id=f"osm_{element.get('type', 'node')}_{element.get('id', '')}",
                company_name=name,
                service_category=category_key,
                website=tags.get("website", tags.get("contact:website", "")),
                email=tags.get("email", tags.get("contact:email", "")),
                phone=tags.get("phone", tags.get("contact:phone", "")),
                street_address=self._build_address(tags),
                city=tags.get("addr:city", ""),
                state=state.upper(),
                postal_code=tags.get("addr:postcode", ""),
                country="US",
                latitude=lat,
                longitude=lon,
                raw_data=json.dumps(tags),
                date_collected=datetime.now(UTC),
                processed=False,
            )
            records.append(record)
        return records

    @staticmethod
    def _build_address(tags: dict) -> str:
        """Build street address from OSM addr tags."""
        parts = []
        house = tags.get("addr:housenumber", "")
        street = tags.get("addr:street", "")
        if house and street:
            parts.append(f"{house} {street}")
        elif street:
            parts.append(street)
        suite = tags.get("addr:unit", tags.get("addr:suite", ""))
        if suite:
            parts.append(f"Suite {suite}")
        return ", ".join(parts)

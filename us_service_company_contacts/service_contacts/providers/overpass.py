"""OpenStreetMap Overpass API provider with combined multi-category tile queries."""

import json
import logging
import random
import time
from datetime import UTC, datetime
from typing import Iterator

import requests
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from service_contacts.categories import CATEGORIES, US_STATE_BOUNDS
from service_contacts.config import OVERPASS_ENDPOINT, OVERPASS_FALLBACK_ENDPOINTS, OVERPASS_TIMEOUT, USER_AGENT
from service_contacts.models import SourceRecord
from service_contacts.providers.base import BaseProvider
from service_contacts.providers.geo_tiles import generate_tiles, tile_key

logger = logging.getLogger("service_contacts.overpass")

# All service-related OSM tags we query in a single combined request per tile.
# Results are classified locally against CATEGORIES after retrieval.
COMBINED_QUERY_TAGS = [
    ("craft", "plumber"), ("craft", "hvac"), ("craft", "heating_engineer"),
    ("craft", "electrician"), ("craft", "gardener"), ("craft", "roofer"),
    ("craft", "painter"), ("craft", "locksmith"), ("craft", "chimney_sweep"),
    ("craft", "floorer"), ("craft", "glazier"), ("craft", "insulation"),
    ("craft", "mason"), ("craft", "bricklayer"), ("craft", "fencing"),
    ("craft", "handyman"), ("craft", "carpet_cleaning"), ("craft", "cleaning"),
    ("craft", "pest_control"), ("craft", "window_cleaning"), ("craft", "mover"),
    ("craft", "restoration"), ("craft", "concrete"), ("craft", "paving"),
    ("craft", "demolition"), ("craft", "solar"), ("craft", "well_drilling"),
    ("craft", "elevator"), ("craft", "fire_protection"), ("craft", "generator"),
    ("craft", "tree_service"), ("craft", "irrigation"), ("craft", "septic"),
    ("craft", "snow_removal"), ("craft", "junk_removal"), ("craft", "pressure_washing"),
    ("craft", "pool_service"), ("craft", "garage_door"), ("craft", "appliance_repair"),
    ("craft", "auto_repair"), ("craft", "towing"), ("craft", "dock_builder"),
    ("craft", "property_maintenance"), ("craft", "inspector"), ("craft", "insulator"),
    ("shop", "car_repair"), ("shop", "plumber"), ("shop", "hvac"),
    ("shop", "electrical"), ("shop", "garden_centre"), ("shop", "roofing"),
    ("shop", "paint"), ("shop", "locksmith"), ("shop", "fireplace"),
    ("shop", "flooring"), ("shop", "fence"), ("shop", "pool"),
    ("shop", "appliance"), ("shop", "cleaning"), ("shop", "heating"),
    ("shop", "glass"), ("shop", "masonry"), ("shop", "solar"),
    ("office", "moving_company"), ("office", "hvac"), ("office", "plumber"),
    ("office", "electrician"), ("office", "cleaning"), ("office", "pest_control"),
    ("office", "roofing"), ("office", "landscaping"), ("office", "security"),
    ("office", "restoration"), ("office", "construction"), ("office", "solar"),
    ("office", "property_management"), ("office", "home_inspection"),
    ("office", "fire_protection"), ("office", "elevator"), ("office", "demolition"),
]


def classify_element(tags: dict, requested_categories: set[str]) -> str | None:
    """Classify an OSM element into a service category based on its tags.
    Returns the best matching category key or None."""
    for cat_key, cat in CATEGORIES.items():
        if cat_key not in requested_categories:
            continue
        for tag_key, tag_value in cat.osm_tags:
            if tags.get(tag_key) == tag_value:
                return cat_key
    return None


class OverpassProvider(BaseProvider):
    """Collect business records using ONE combined query per geographic tile."""

    name = "openstreetmap_overpass"

    def __init__(self, timeout: int | None = None, endpoints: list[str] | None = None, tile_size: float = 1.0):
        self._last_request_time = 0.0
        configured = endpoints or [OVERPASS_ENDPOINT, *OVERPASS_FALLBACK_ENDPOINTS]
        self.endpoints = list(dict.fromkeys(configured))
        self.timeout = timeout or OVERPASS_TIMEOUT
        self.tile_size = tile_size
        self.failures: list[dict] = []
        self.completed_tiles: set[str] = set()
        self._session = requests.Session()
        self._session.headers["User-Agent"] = USER_AGENT
        self._endpoint_cooldown: dict[str, float] = {}  # endpoint -> available_after timestamp
        self._requests_per_second = 0.4  # Default, can be overridden

    def set_rate(self, rps: float):
        self._requests_per_second = rps

    def supports_resume(self) -> bool:
        return True

    def collect(
        self,
        states: list[str],
        categories: list[str],
        limit: int = 5000,
    ) -> Iterator[SourceRecord]:
        """Query Overpass with ONE combined request per tile, classify locally."""
        requested_categories = set(categories) if categories else set(CATEGORIES.keys())
        count = 0

        for state in states:
            if count >= limit:
                break
            bounds = US_STATE_BOUNDS.get(state.upper())
            if not bounds:
                logger.warning(f"Unknown state: {state}")
                continue

            tiles = generate_tiles(bounds, self.tile_size)
            logger.info(f"State {state}: {len(tiles)} tiles at {self.tile_size}° (combined query)")

            for tile_idx, tile_bounds in enumerate(tiles):
                if count >= limit:
                    break

                tkey = tile_key(state, "ALL", tile_idx)
                if tkey in self.completed_tiles:
                    continue

                try:
                    elements = self._query_tile_combined(state, tile_bounds)
                    self.completed_tiles.add(tkey)

                    # Classify locally
                    for element in elements:
                        if count >= limit:
                            break
                        tags = element.get("tags", {})
                        name = tags.get("name", "").strip()
                        if not name:
                            continue

                        category = classify_element(tags, requested_categories)
                        if not category:
                            continue

                        lat = element.get("lat") or element.get("center", {}).get("lat")
                        lon = element.get("lon") or element.get("center", {}).get("lon")

                        record = SourceRecord(
                            source_name=self.name,
                            source_url=f"https://www.openstreetmap.org/{element.get('type', 'node')}/{element.get('id', '')}",
                            source_record_id=f"osm_{element.get('type', 'node')}_{element.get('id', '')}",
                            company_name=name,
                            service_category=category,
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
                        yield record
                        count += 1

                except Exception as e:
                    logger.warning(f"Tile {state}/{tile_idx} failed: {e}")
                    self.failures.append({
                        "tile_key": tkey,
                        "state": state.upper(),
                        "category": "ALL",
                        "tile_index": tile_idx,
                        "error_type": type(e).__name__,
                        "error": str(e)[:200],
                        "failed_at": datetime.now(UTC).isoformat(),
                    })
                    continue

        logger.info(f"Collection complete: {count} records, {len(self.completed_tiles)} tiles OK, {len(self.failures)} failed")

    def _rate_limit(self):
        """Enforce rate limiting with jitter."""
        if self._requests_per_second <= 0:
            return
        min_interval = 1.0 / self._requests_per_second
        jitter = random.uniform(0.1, 0.5)
        elapsed = time.time() - self._last_request_time
        wait = min_interval + jitter - elapsed
        if wait > 0:
            time.sleep(wait)
        self._last_request_time = time.time()

    def _get_available_endpoint(self) -> str | None:
        """Get an endpoint not in cooldown."""
        now = time.time()
        for ep in self.endpoints:
            if self._endpoint_cooldown.get(ep, 0) <= now:
                return ep
        # All cooling down — wait for the soonest one
        soonest = min(self._endpoint_cooldown.values())
        wait = soonest - now
        if wait > 0:
            logger.info(f"All endpoints cooling down, waiting {wait:.0f}s")
            time.sleep(wait)
        return self.endpoints[0]

    def _cooldown_endpoint(self, endpoint: str, seconds: int = 35):
        """Put an endpoint in cooldown."""
        self._endpoint_cooldown[endpoint] = time.time() + seconds

    def _query_tile_combined(self, state: str, bounds: tuple[float, float, float, float]) -> list[dict]:
        """Execute ONE combined query for all service tags in a tile."""
        bbox = f"{bounds[0]},{bounds[1]},{bounds[2]},{bounds[3]}"

        # Build combined tag filters
        tag_filters = []
        for key, value in COMBINED_QUERY_TAGS:
            tag_filters.append(f'node["{key}"="{value}"]({bbox});')
            tag_filters.append(f'way["{key}"="{value}"]({bbox});')

        query = f"""[out:json][timeout:{self.timeout}];
(
  {"".join(tag_filters)}
);
out body center 500;"""

        # Try endpoints with failover
        last_error: Exception | None = None
        for _ in range(len(self.endpoints)):
            endpoint = self._get_available_endpoint()
            if not endpoint:
                break
            try:
                self._rate_limit()
                response = self._session.post(endpoint, data={"data": query}, timeout=self.timeout)

                if response.status_code == 429:
                    retry_after = int(response.headers.get("Retry-After", "35"))
                    logger.warning(f"429 from {endpoint.split('/')[2]}, cooldown {retry_after}s")
                    self._cooldown_endpoint(endpoint, retry_after)
                    continue  # Try next endpoint immediately

                response.raise_for_status()
                data = response.json()
                elements = data.get("elements", [])
                if elements:
                    logger.debug(f"  Tile {state} {bbox[:20]}... -> {len(elements)} elements")
                return elements

            except requests.Timeout:
                logger.debug(f"Timeout from {endpoint.split('/')[2]}")
                self._cooldown_endpoint(endpoint, 60)
                last_error = requests.Timeout(f"Timeout from {endpoint}")
            except requests.ConnectionError as exc:
                self._cooldown_endpoint(endpoint, 120)
                last_error = exc
            except requests.HTTPError as exc:
                if hasattr(exc, 'response') and exc.response and exc.response.status_code in (400, 401, 403):
                    raise  # Don't retry client errors
                self._cooldown_endpoint(endpoint, 30)
                last_error = exc

        if last_error:
            raise RuntimeError(f"All endpoints failed: {last_error}") from last_error
        return []

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

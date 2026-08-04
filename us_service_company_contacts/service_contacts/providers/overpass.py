"""OpenStreetMap Overpass API provider."""

import json
import logging
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

logger = logging.getLogger("service_contacts.overpass")


class OverpassProvider(BaseProvider):
    """Collect business records from OpenStreetMap via Overpass API."""

    name = "openstreetmap_overpass"

    def __init__(self, timeout: int | None = None, endpoints: list[str] | None = None):
        self._last_request_time = 0.0
        configured = endpoints or [OVERPASS_ENDPOINT, *OVERPASS_FALLBACK_ENDPOINTS]
        self.endpoints = list(dict.fromkeys(configured))
        self.timeout = timeout or OVERPASS_TIMEOUT
        self.failures: list[dict[str, str]] = []
        self._session = requests.Session()
        self._session.headers["User-Agent"] = USER_AGENT

    def supports_resume(self) -> bool:
        return False

    def collect(
        self,
        states: list[str],
        categories: list[str],
        limit: int = 5000,
    ) -> Iterator[SourceRecord]:
        """Query Overpass for businesses matching categories in given states."""
        count = 0
        for state in states:
            if count >= limit:
                break
            bounds = US_STATE_BOUNDS.get(state.upper())
            if not bounds:
                logger.warning(f"Unknown state: {state}")
                continue

            for cat_key in categories:
                if count >= limit:
                    break
                cat = CATEGORIES.get(cat_key)
                if not cat:
                    logger.warning(f"Unknown category: {cat_key}")
                    continue

                logger.info(f"Querying Overpass: {cat.name} in {state}")
                try:
                    records = self._query_overpass(state, bounds, cat_key, cat.osm_tags, limit - count)
                    for record in records:
                        yield record
                        count += 1
                        if count >= limit:
                            break
                except Exception as e:
                    logger.error(f"Overpass query failed for {cat_key}/{state}: {e}")
                    self.failures.append(
                        {
                            "provider": self.name,
                            "state": state.upper(),
                            "category": cat_key,
                            "error_type": type(e).__name__,
                            "error": str(e),
                            "failed_at": datetime.now(UTC).isoformat(),
                        }
                    )
                    continue

        logger.info(f"Overpass collection complete: {count} records")

    def _rate_limit(self):
        """Enforce rate limiting between requests."""
        if REQUESTS_PER_SECOND <= 0:
            return
        min_interval = 1.0 / REQUESTS_PER_SECOND
        elapsed = time.time() - self._last_request_time
        if elapsed < min_interval:
            time.sleep(min_interval - elapsed)
        self._last_request_time = time.time()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=4, max=60),
        retry=retry_if_exception_type((requests.Timeout, requests.ConnectionError)),
    )
    def _post_query(self, endpoint: str, query: str) -> requests.Response:
        self._rate_limit()
        response = self._session.post(endpoint, data={"data": query}, timeout=self.timeout)
        response.raise_for_status()
        return response

    def _query_overpass(
        self,
        state: str,
        bounds: tuple[float, float, float, float],
        category_key: str,
        osm_tags: list[tuple[str, str]],
        remaining: int,
    ) -> list[SourceRecord]:
        """Execute a single Overpass query and parse results."""
        # Build Overpass QL query
        bbox = f"{bounds[0]},{bounds[1]},{bounds[2]},{bounds[3]}"
        tag_filters = []
        for key, value in osm_tags:
            tag_filters.append(f'node["{key}"="{value}"]({bbox});')
            tag_filters.append(f'way["{key}"="{value}"]({bbox});')

        query = f"""
        [out:json][timeout:90];
        (
          {"".join(tag_filters)}
        );
        out body center {min(remaining, 500)};
        """

        last_error: Exception | None = None
        response: requests.Response | None = None
        for endpoint in self.endpoints:
            try:
                logger.debug("Trying Overpass endpoint %s", endpoint)
                response = self._post_query(endpoint, query)
                break
            except (requests.Timeout, requests.ConnectionError, requests.HTTPError) as exc:
                last_error = exc
                logger.warning("Overpass endpoint failed (%s): %s", endpoint, exc)
        if response is None:
            raise RuntimeError(f"All Overpass endpoints failed: {last_error}") from last_error
        data = response.json()

        records = []
        for element in data.get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name", "").strip()
            if not name:
                continue

            # Extract coordinates
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

        logger.info(f"  → {len(records)} records from {category_key}/{state}")
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

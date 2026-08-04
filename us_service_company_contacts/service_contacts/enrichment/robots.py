"""robots.txt compliance checking."""

import logging
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import requests

from service_contacts.config import HTTP_TIMEOUT, USER_AGENT

logger = logging.getLogger("service_contacts.robots")

_cache: dict[str, RobotFileParser | None] = {}


def can_fetch(url: str) -> bool:
    """Check if our user agent is allowed to fetch the given URL."""
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    robots_url = f"{base}/robots.txt"

    if base not in _cache:
        _cache[base] = _fetch_robots(robots_url)

    parser = _cache[base]
    if parser is None:
        # Could not retrieve robots.txt — assume allowed
        return True

    return parser.can_fetch(USER_AGENT, url)


def _fetch_robots(robots_url: str) -> RobotFileParser | None:
    """Fetch and parse robots.txt."""
    try:
        response = requests.get(robots_url, timeout=HTTP_TIMEOUT, headers={"User-Agent": USER_AGENT})
        if response.status_code == 200:
            parser = RobotFileParser()
            parser.parse(response.text.splitlines())
            return parser
        # 404 or other = no restrictions
        return None
    except Exception as e:
        logger.debug(f"Could not fetch {robots_url}: {e}")
        return None


def clear_cache():
    """Clear the robots.txt cache."""
    _cache.clear()

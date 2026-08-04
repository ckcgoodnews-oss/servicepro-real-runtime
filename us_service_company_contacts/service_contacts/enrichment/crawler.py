"""Website crawler with robots.txt compliance and rate limiting."""

import logging
import time
from datetime import UTC, datetime
from urllib.parse import urljoin, urlparse

import requests
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from service_contacts.config import HTTP_TIMEOUT, MAX_PAGES_PER_DOMAIN, REQUESTS_PER_SECOND, USER_AGENT
from service_contacts.enrichment.robots import can_fetch

logger = logging.getLogger("service_contacts.crawler")

CRAWL_PATHS = ["/", "/contact", "/contact-us", "/about", "/about-us", "/service-area", "/locations"]

# Track last request time per domain
_domain_last_request: dict[str, float] = {}


class CrawlResult:
    def __init__(self, url: str, final_url: str, status_code: int, html: str, error: str = ""):
        self.url = url
        self.final_url = final_url
        self.status_code = status_code
        self.html = html
        self.error = error
        self.timestamp = datetime.now(UTC)


def crawl_website(base_url: str) -> list[CrawlResult]:
    """Crawl a website's key pages, respecting robots.txt and rate limits."""
    if not base_url:
        return []

    # Normalize
    if not base_url.startswith("http"):
        base_url = f"https://{base_url}"

    parsed = urlparse(base_url)
    domain = parsed.netloc
    results: list[CrawlResult] = []

    for path in CRAWL_PATHS[:MAX_PAGES_PER_DOMAIN]:
        url = urljoin(base_url, path)

        # Check robots.txt
        if not can_fetch(url):
            logger.debug(f"Blocked by robots.txt: {url}")
            results.append(CrawlResult(url=url, final_url="", status_code=0, html="", error="blocked_by_robots"))
            continue

        # Rate limit per domain
        _enforce_rate_limit(domain)

        try:
            result = _fetch_page(url)
            results.append(result)
        except Exception as e:
            logger.debug(f"Failed to fetch {url}: {e}")
            results.append(CrawlResult(url=url, final_url="", status_code=0, html="", error=str(e)))

    return results


def _enforce_rate_limit(domain: str):
    """Ensure minimum interval between requests to same domain."""
    min_interval = 1.0 / REQUESTS_PER_SECOND if REQUESTS_PER_SECOND > 0 else 2.0
    last = _domain_last_request.get(domain, 0)
    elapsed = time.time() - last
    if elapsed < min_interval:
        time.sleep(min_interval - elapsed)
    _domain_last_request[domain] = time.time()


@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((requests.Timeout, requests.ConnectionError)),
)
def _fetch_page(url: str) -> CrawlResult:
    """Fetch a single page."""
    response = requests.get(
        url,
        timeout=HTTP_TIMEOUT,
        headers={"User-Agent": USER_AGENT},
        allow_redirects=True,
    )

    # Don't retry client errors
    if response.status_code in (401, 403, 404):
        return CrawlResult(
            url=url,
            final_url=response.url,
            status_code=response.status_code,
            html="",
            error=f"http_{response.status_code}",
        )

    return CrawlResult(
        url=url,
        final_url=response.url,
        status_code=response.status_code,
        html=response.text[:500_000],  # Cap at 500KB
    )

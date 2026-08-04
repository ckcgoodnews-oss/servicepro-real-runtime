"""Website availability verification."""

import logging
from datetime import datetime

import requests

from service_contacts.config import HTTP_TIMEOUT, USER_AGENT
from service_contacts.enrichment.robots import can_fetch

logger = logging.getLogger("service_contacts.verification.website")


def verify_website(url: str) -> dict:
    """
    Verify website is accessible.

    Returns dict with:
        website_status, website_http_status, website_final_url, website_checked_at, robots_allowed
    """
    if not url:
        return {
            "website_status": "invalid",
            "website_http_status": None,
            "website_final_url": "",
            "website_checked_at": datetime.utcnow().isoformat(),
            "robots_allowed": None,
        }

    if not url.startswith("http"):
        url = f"https://{url}"

    # Check robots.txt
    robots_allowed = can_fetch(url)
    if not robots_allowed:
        return {
            "website_status": "blocked_by_robots",
            "website_http_status": None,
            "website_final_url": "",
            "website_checked_at": datetime.utcnow().isoformat(),
            "robots_allowed": False,
        }

    try:
        response = requests.head(
            url,
            timeout=HTTP_TIMEOUT,
            headers={"User-Agent": USER_AGENT},
            allow_redirects=True,
        )

        final_url = response.url
        status_code = response.status_code

        if status_code == 200:
            status = "active"
        elif 300 <= status_code < 400:
            status = "redirected"
        elif status_code == 403:
            status = "blocked_by_robots"
        else:
            status = "inaccessible"

        # If final URL differs significantly, mark as redirected
        if final_url and final_url.rstrip("/") != url.rstrip("/"):
            status = "redirected" if status == "active" else status

        return {
            "website_status": status,
            "website_http_status": status_code,
            "website_final_url": final_url,
            "website_checked_at": datetime.utcnow().isoformat(),
            "robots_allowed": True,
        }

    except requests.Timeout:
        return {
            "website_status": "timeout",
            "website_http_status": None,
            "website_final_url": "",
            "website_checked_at": datetime.utcnow().isoformat(),
            "robots_allowed": robots_allowed,
        }

    except Exception as e:
        logger.debug(f"Website verification failed for {url}: {e}")
        return {
            "website_status": "inaccessible",
            "website_http_status": None,
            "website_final_url": "",
            "website_checked_at": datetime.utcnow().isoformat(),
            "robots_allowed": robots_allowed,
        }

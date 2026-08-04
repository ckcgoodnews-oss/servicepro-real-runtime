"""Retry configuration utilities."""

import requests
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential


def transient_retry(max_attempts: int = 3):
    """Decorator for retrying transient HTTP failures only."""
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=2, min=2, max=30),
        retry=retry_if_exception_type((requests.Timeout, requests.ConnectionError, OSError)),
    )

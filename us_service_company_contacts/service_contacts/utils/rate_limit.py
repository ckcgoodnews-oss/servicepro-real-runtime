"""Rate limiting utilities."""

import time
import threading


class RateLimiter:
    """Thread-safe rate limiter."""

    def __init__(self, requests_per_second: float = 0.5):
        self._interval = 1.0 / requests_per_second if requests_per_second > 0 else 2.0
        self._last_request = 0.0
        self._lock = threading.Lock()

    def wait(self):
        """Block until it's safe to make the next request."""
        with self._lock:
            now = time.time()
            elapsed = now - self._last_request
            if elapsed < self._interval:
                time.sleep(self._interval - elapsed)
            self._last_request = time.time()

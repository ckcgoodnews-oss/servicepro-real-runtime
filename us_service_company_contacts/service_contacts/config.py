"""Application configuration from environment and config.yaml."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


def env(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


def env_int(key: str, default: int = 0) -> int:
    return int(os.environ.get(key, str(default)))


def env_float(key: str, default: float = 0.0) -> float:
    return float(os.environ.get(key, str(default)))


# Core settings
USER_AGENT = env("USER_AGENT", "ServiceContactsBot/1.0 (+mailto:admin@example.com)")
ADMIN_CONTACT_EMAIL = env("ADMIN_CONTACT_EMAIL", "admin@example.com")
DATABASE_URL = env("DATABASE_URL", f"sqlite:///{BASE_DIR / 'data' / 'service_contacts.db'}")
OVERPASS_ENDPOINT = env("OVERPASS_ENDPOINT", "https://overpass-api.de/api/interpreter")

# Rate limiting
HTTP_TIMEOUT = env_int("HTTP_TIMEOUT", 30)
REQUESTS_PER_SECOND = env_float("REQUESTS_PER_SECOND", 0.5)
MAX_WORKERS = env_int("MAX_WORKERS", 5)
MAX_PAGES_PER_DOMAIN = env_int("MAX_PAGES_PER_DOMAIN", 5)

# Paths
DATA_DIR = BASE_DIR / "data"
LOG_DIR = BASE_DIR / "logs"
DATA_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

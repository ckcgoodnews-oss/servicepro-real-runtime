"""Logging configuration with rotating file handlers."""

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

from service_contacts.config import LOG_DIR


def setup_logging(level: str = "INFO") -> logging.Logger:
    """Configure application-wide logging."""
    logger = logging.getLogger("service_contacts")
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Console handler
    console = logging.StreamHandler()
    console.setFormatter(logging.Formatter("%(asctime)s %(levelname)-8s %(message)s", datefmt="%H:%M:%S"))
    logger.addHandler(console)

    # Application log file
    app_log = LOG_DIR / "service_contacts.log"
    file_handler = RotatingFileHandler(app_log, maxBytes=10_485_760, backupCount=5)
    file_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    logger.addHandler(file_handler)

    return logger


def get_audit_logger() -> logging.Logger:
    """Separate audit logger for crawl decisions."""
    audit = logging.getLogger("service_contacts.audit")
    audit.setLevel(logging.INFO)

    audit_log = LOG_DIR / "crawl_audit.log"
    handler = RotatingFileHandler(audit_log, maxBytes=10_485_760, backupCount=5)
    handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
    audit.addHandler(handler)

    return audit

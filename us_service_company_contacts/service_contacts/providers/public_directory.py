"""Public directory provider interface (extensible stub)."""

import logging
from typing import Iterator

from service_contacts.models import SourceRecord
from service_contacts.providers.base import BaseProvider

logger = logging.getLogger("service_contacts.public_directory")


class PublicDirectoryProvider(BaseProvider):
    """
    Interface for public state/local business directories.

    This is a pluggable interface. Implement subclasses for specific
    public datasets whose terms allow automated access.

    Document: source URL, license, retrieval date, attribution requirements.
    """

    name = "public_directory"

    def supports_resume(self) -> bool:
        return False

    def collect(
        self,
        states: list[str],
        categories: list[str],
        limit: int = 5000,
    ) -> Iterator[SourceRecord]:
        """No-op base implementation. Override in subclasses."""
        logger.info("PublicDirectoryProvider: no datasets configured. Skipping.")
        return iter([])

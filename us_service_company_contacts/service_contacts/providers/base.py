"""Base provider interface."""

from abc import ABC, abstractmethod
from typing import Iterator

from service_contacts.models import SourceRecord


class BaseProvider(ABC):
    """Abstract base for data source providers."""

    name: str = "base"

    @abstractmethod
    def collect(
        self,
        states: list[str],
        categories: list[str],
        limit: int = 5000,
    ) -> Iterator[SourceRecord]:
        """Yield SourceRecord objects from the data source."""
        ...

    @abstractmethod
    def supports_resume(self) -> bool:
        """Whether this provider can resume interrupted collection."""
        ...

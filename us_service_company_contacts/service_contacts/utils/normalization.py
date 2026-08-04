"""Text normalization utilities for deduplication."""

import re

import tldextract


def normalize_domain(url_or_domain: str) -> str:
    """Extract and normalize a domain for deduplication."""
    if not url_or_domain:
        return ""
    extracted = tldextract.extract(url_or_domain)
    if extracted.domain and extracted.suffix:
        return f"{extracted.domain}.{extracted.suffix}".lower()
    return ""


def normalize_company_name(name: str) -> str:
    """Normalize company name for dedup matching."""
    if not name:
        return ""
    # Lowercase
    result = name.lower()
    # Remove common suffixes
    for suffix in ["llc", "inc", "corp", "co", "ltd", "company", "services", "service"]:
        result = re.sub(rf"\b{suffix}\.?\b", "", result)
    # Remove punctuation
    result = re.sub(r"[^a-z0-9\s]", "", result)
    # Collapse whitespace
    result = re.sub(r"\s+", " ", result).strip()
    return result


def normalize_phone_for_dedup(phone: str) -> str:
    """Normalize phone to digits-only for dedup."""
    if not phone:
        return ""
    digits = re.sub(r"[^\d]", "", phone)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits if len(digits) == 10 else ""

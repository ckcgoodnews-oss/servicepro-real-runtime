"""Phone number extraction and normalization."""

import re
import logging

import phonenumbers

logger = logging.getLogger("service_contacts.phone_parser")

# Common US phone patterns in HTML
PHONE_PATTERNS = [
    re.compile(r"\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}"),
    re.compile(r"\+1[\s.\-]?\d{3}[\s.\-]?\d{3}[\s.\-]?\d{4}"),
    re.compile(r"1[\-.]?\d{3}[\-.]?\d{3}[\-.]?\d{4}"),
]

# Patterns near phone context
PHONE_CONTEXT = re.compile(
    r"(?:phone|tel|call|fax|mobile|cell|office)[\s:]*",
    re.IGNORECASE,
)


def extract_phones(html: str) -> list[dict]:
    """Extract phone numbers from HTML content."""
    if not html:
        return []

    results = []
    seen = set()

    # Strip HTML tags for phone extraction
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text)

    for pattern in PHONE_PATTERNS:
        for match in pattern.finditer(text):
            raw = match.group().strip()
            normalized = normalize_phone(raw)
            if normalized and normalized not in seen:
                seen.add(normalized)
                e164 = to_e164(normalized)
                results.append({
                    "phone": normalized,
                    "phone_e164": e164,
                    "phone_valid": e164 != "",
                    "phone_source": "website",
                })

    return results


def normalize_phone(raw: str) -> str:
    """Normalize a raw phone string to digits only."""
    digits = re.sub(r"[^\d]", "", raw)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    return ""


def to_e164(formatted: str) -> str:
    """Convert formatted US phone to E.164."""
    try:
        parsed = phonenumbers.parse(formatted, "US")
        if phonenumbers.is_valid_number(parsed):
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    except phonenumbers.NumberParseException:
        pass
    return ""


def validate_phone(phone: str) -> tuple[str, bool]:
    """Validate and format a phone number. Returns (e164, is_valid)."""
    if not phone:
        return "", False
    try:
        parsed = phonenumbers.parse(phone, "US")
        valid = phonenumbers.is_valid_number(parsed)
        e164 = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164) if valid else ""
        return e164, valid
    except phonenumbers.NumberParseException:
        return "", False

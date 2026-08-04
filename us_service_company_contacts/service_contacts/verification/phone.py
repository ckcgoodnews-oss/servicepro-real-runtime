"""Phone number validation."""

from service_contacts.enrichment.phone_parser import validate_phone


def verify_phone(phone: str) -> dict:
    """Validate and normalize a phone number to E.164."""
    e164, valid = validate_phone(phone)
    return {
        "phone_e164": e164,
        "phone_valid": valid,
    }

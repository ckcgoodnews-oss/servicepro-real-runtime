"""Email verification (syntax + domain check only — no SMTP probing)."""

import logging

from service_contacts.enrichment.email_parser import ROLE_PREFIXES, is_valid_email_syntax
from service_contacts.verification.dns import _check_mx, extract_domain

logger = logging.getLogger("service_contacts.verification.email")


def verify_email(email: str, website_domain: str = "") -> dict:
    """
    Verify an email address.

    This performs:
    - Syntax validation
    - Role-based classification
    - Domain MX check
    - Domain match against company website

    This does NOT:
    - Probe SMTP for mailbox existence
    - Attempt login or credential testing
    - Contact the mail server directly

    A passing MX check only confirms the domain can receive email,
    not that a specific mailbox exists.

    Returns dict with verification fields.
    """
    if not email:
        return {
            "email": "",
            "email_is_public": None,
            "email_is_role_based": None,
            "email_syntax_valid": None,
            "email_domain_matches_website": None,
            "email_domain_has_mx": None,
            "email_verification_status": "no_public_email",
        }

    syntax_valid = is_valid_email_syntax(email)
    if not syntax_valid:
        return {
            "email": email,
            "email_is_public": None,
            "email_is_role_based": None,
            "email_syntax_valid": False,
            "email_domain_matches_website": None,
            "email_domain_has_mx": None,
            "email_verification_status": "invalid_format",
        }

    local_part = email.split("@")[0].lower()
    email_domain = email.split("@")[1].lower() if "@" in email else ""

    is_role = local_part in ROLE_PREFIXES or any(local_part.startswith(p + ".") for p in ROLE_PREFIXES)
    domain_matches = _domains_match(email_domain, website_domain) if website_domain else None
    has_mx = _check_mx(email_domain) if email_domain else None

    # Determine verification status
    if has_mx and is_role:
        status = "public_role_address_verified_domain"
    elif has_mx:
        status = "public_business_address_verified_domain"
    elif not has_mx:
        status = "public_address_domain_unverified"
    else:
        status = "public_address_domain_unverified"

    return {
        "email": email,
        "email_is_public": True,
        "email_is_role_based": is_role,
        "email_syntax_valid": True,
        "email_domain_matches_website": domain_matches,
        "email_domain_has_mx": has_mx,
        "email_verification_status": status,
    }


def _domains_match(email_domain: str, website_domain: str) -> bool:
    """Check if email domain matches the company website domain."""
    if not email_domain or not website_domain:
        return False
    ed = extract_domain(email_domain)
    wd = extract_domain(website_domain)
    return ed == wd if ed and wd else email_domain == website_domain

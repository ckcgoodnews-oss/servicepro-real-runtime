"""Email extraction and classification from HTML."""

import logging
import re

logger = logging.getLogger("service_contacts.email_parser")

# Regex for email addresses
EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b"
)

# Role-based prefixes (preferred for business contacts)
ROLE_PREFIXES = frozenset([
    "info", "contact", "sales", "service", "support", "office",
    "estimates", "quotes", "appointments", "scheduling",
    "admin", "billing", "help", "hello", "team", "inquiries",
    "general", "bookings", "dispatch", "jobs", "work",
])

# Patterns to exclude (not business contacts)
EXCLUDE_PATTERNS = frozenset([
    "noreply", "no-reply", "donotreply", "mailer-daemon",
    "unsubscribe", "newsletter", "postmaster", "abuse",
])


def extract_emails(html: str) -> list[dict]:
    """Extract email addresses from HTML content."""
    if not html:
        return []

    # Decode HTML entities
    text = html.replace("&#64;", "@").replace("&#46;", ".").replace("[at]", "@").replace("[dot]", ".")

    found = EMAIL_PATTERN.findall(text)
    results = []
    seen = set()

    for email in found:
        email_lower = email.lower().strip()
        if email_lower in seen:
            continue
        seen.add(email_lower)

        # Skip excluded patterns
        local_part = email_lower.split("@")[0]
        if any(excl in local_part for excl in EXCLUDE_PATTERNS):
            continue

        # Skip image/asset filenames that match email pattern
        if any(email_lower.endswith(ext) for ext in [".png", ".jpg", ".gif", ".svg", ".css", ".js"]):
            continue

        is_role = local_part in ROLE_PREFIXES or any(local_part.startswith(p + ".") for p in ROLE_PREFIXES)

        results.append({
            "email": email_lower,
            "is_role_based": is_role,
            "is_public": True,
            "syntax_valid": True,
        })

    # Sort: role-based first
    results.sort(key=lambda x: (not x["is_role_based"], x["email"]))
    return results


def is_valid_email_syntax(email: str) -> bool:
    """Check if email has valid syntax."""
    if not email or "@" not in email:
        return False
    return bool(EMAIL_PATTERN.fullmatch(email))


def classify_email(email: str) -> str:
    """Classify email as role-based or personal."""
    if not email:
        return "no_public_email"
    local = email.split("@")[0].lower()
    if local in ROLE_PREFIXES:
        return "role_based"
    return "personal"

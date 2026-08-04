"""DNS and MX record verification."""

import logging
from datetime import datetime

import dns.resolver
import tldextract

logger = logging.getLogger("service_contacts.verification.dns")

DNS_TIMEOUT = 10


def verify_domain(url_or_domain: str) -> dict:
    """
    Verify domain has DNS and MX records.

    Note: MX presence does NOT prove a specific mailbox exists.
    It only confirms the domain is configured to receive email.

    Returns dict with:
        domain, domain_has_dns, domain_has_mx, domain_checked_at
    """
    domain = extract_domain(url_or_domain)
    if not domain:
        return {
            "domain": "",
            "domain_has_dns": None,
            "domain_has_mx": None,
            "domain_checked_at": datetime.utcnow().isoformat(),
        }

    has_dns = _check_dns(domain)
    has_mx = _check_mx(domain) if has_dns else False

    return {
        "domain": domain,
        "domain_has_dns": has_dns,
        "domain_has_mx": has_mx,
        "domain_checked_at": datetime.utcnow().isoformat(),
    }


def extract_domain(url_or_domain: str) -> str:
    """Extract the registered domain from a URL or domain string."""
    if not url_or_domain:
        return ""
    extracted = tldextract.extract(url_or_domain)
    if extracted.domain and extracted.suffix:
        return f"{extracted.domain}.{extracted.suffix}"
    return ""


def _check_dns(domain: str) -> bool:
    """Check if domain has any A or AAAA records."""
    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = DNS_TIMEOUT
        resolver.lifetime = DNS_TIMEOUT
        resolver.resolve(domain, "A")
        return True
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
        pass
    except Exception:
        pass

    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = DNS_TIMEOUT
        resolver.lifetime = DNS_TIMEOUT
        resolver.resolve(domain, "AAAA")
        return True
    except Exception:
        return False


def _check_mx(domain: str) -> bool:
    """Check if domain has MX records."""
    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = DNS_TIMEOUT
        resolver.lifetime = DNS_TIMEOUT
        answers = resolver.resolve(domain, "MX")
        return len(answers) > 0
    except Exception:
        return False

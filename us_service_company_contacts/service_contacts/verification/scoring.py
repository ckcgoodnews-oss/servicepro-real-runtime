"""Confidence score calculation."""


def calculate_confidence(company: dict) -> int:
    """
    Calculate transparent confidence score from 0-100.

    Weighting:
    - company name present: 5
    - service category present: 5
    - active website: 20
    - domain DNS valid: 10
    - domain MX valid: 10
    - public phone valid: 15
    - complete public address: 10
    - public role-based email: 15
    - email domain matches website: 10
    """
    score = 0

    if company.get("company_name"):
        score += 5
    if company.get("service_category"):
        score += 5
    if company.get("website_status") == "active":
        score += 20
    elif company.get("website_status") == "redirected":
        score += 10
    if company.get("domain_has_dns"):
        score += 10
    if company.get("domain_has_mx"):
        score += 10
    if company.get("phone_valid"):
        score += 15
    if company.get("street_address") and company.get("city") and company.get("state") and company.get("postal_code"):
        score += 10
    if company.get("email_is_role_based"):
        score += 15
    elif company.get("email") and company.get("email_syntax_valid"):
        score += 8
    if company.get("email_domain_matches_website"):
        score += 10

    return min(100, score)

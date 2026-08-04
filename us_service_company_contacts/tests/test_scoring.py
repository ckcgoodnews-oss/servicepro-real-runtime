"""Tests for confidence scoring."""

from service_contacts.verification.scoring import calculate_confidence


def test_empty_record():
    assert calculate_confidence({}) == 0


def test_full_record():
    record = {
        "company_name": "Acme Plumbing",
        "service_category": "plumbing",
        "website_status": "active",
        "domain_has_dns": True,
        "domain_has_mx": True,
        "phone_valid": True,
        "street_address": "123 Main St",
        "city": "Indianapolis",
        "state": "IN",
        "postal_code": "46201",
        "email": "info@acmeplumbing.com",
        "email_is_role_based": True,
        "email_syntax_valid": True,
        "email_domain_matches_website": True,
    }
    score = calculate_confidence(record)
    assert score == 100


def test_partial_record():
    record = {
        "company_name": "Test LLC",
        "service_category": "hvac",
        "website_status": "active",
        "domain_has_dns": True,
        "domain_has_mx": False,
        "phone_valid": True,
    }
    score = calculate_confidence(record)
    # 5 + 5 + 20 + 10 + 0 + 15 = 55
    assert score == 55


def test_redirected_website():
    record = {
        "company_name": "Test",
        "website_status": "redirected",
    }
    score = calculate_confidence(record)
    # 5 + 10 = 15
    assert score == 15


def test_max_100():
    # Even with extra fields, cap at 100
    record = {
        "company_name": "A",
        "service_category": "b",
        "website_status": "active",
        "domain_has_dns": True,
        "domain_has_mx": True,
        "phone_valid": True,
        "street_address": "x",
        "city": "y",
        "state": "IN",
        "postal_code": "46201",
        "email": "info@x.com",
        "email_is_role_based": True,
        "email_syntax_valid": True,
        "email_domain_matches_website": True,
    }
    assert calculate_confidence(record) == 100

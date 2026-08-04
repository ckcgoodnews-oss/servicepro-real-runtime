"""Tests for phone extraction and normalization."""

from service_contacts.enrichment.phone_parser import extract_phones, normalize_phone, to_e164, validate_phone


def test_extract_standard_format():
    html = "<p>Call us at (317) 555-1234</p>"
    results = extract_phones(html)
    assert len(results) >= 1
    assert results[0]["phone_valid"] is True


def test_extract_dot_format():
    html = "<p>Phone: 317.555.1234</p>"
    results = extract_phones(html)
    assert len(results) >= 1


def test_extract_with_country_code():
    html = "<p>+1 317-555-1234</p>"
    results = extract_phones(html)
    assert len(results) >= 1
    assert results[0]["phone_e164"] == "+13175551234"


def test_normalize_10_digits():
    assert normalize_phone("3175551234") == "(317) 555-1234"
    assert normalize_phone("13175551234") == "(317) 555-1234"


def test_normalize_invalid():
    assert normalize_phone("123") == ""
    assert normalize_phone("") == ""


def test_to_e164():
    assert to_e164("(317) 555-1234") == "+13175551234"
    assert to_e164("invalid") == ""


def test_validate_phone():
    e164, valid = validate_phone("(317) 555-1234")
    assert valid is True
    assert e164 == "+13175551234"

    e164, valid = validate_phone("")
    assert valid is False


def test_dedup_phones():
    html = "<p>(317) 555-1234 and 317-555-1234 and 3175551234</p>"
    results = extract_phones(html)
    # Should deduplicate to one number
    assert len(results) == 1

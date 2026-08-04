"""Tests for email extraction and classification."""

from service_contacts.enrichment.email_parser import extract_emails, is_valid_email_syntax, classify_email


def test_extract_simple_email():
    html = '<a href="mailto:info@acmeplumbing.com">Contact us</a>'
    results = extract_emails(html)
    assert len(results) == 1
    assert results[0]["email"] == "info@acmeplumbing.com"
    assert results[0]["is_role_based"] is True


def test_extract_multiple_emails():
    html = """
    <p>Email us at contact@example.com or sales@example.com</p>
    <p>Personal: john.doe@example.com</p>
    """
    results = extract_emails(html)
    assert len(results) == 3
    # Role-based should come first
    assert results[0]["is_role_based"] is True


def test_exclude_noreply():
    html = '<p>noreply@example.com and info@example.com</p>'
    results = extract_emails(html)
    assert len(results) == 1
    assert results[0]["email"] == "info@example.com"


def test_exclude_file_extensions():
    html = '<img src="logo@2x.png"> info@business.com'
    results = extract_emails(html)
    assert len(results) == 1
    assert results[0]["email"] == "info@business.com"


def test_decode_obfuscated():
    html = "contact&#64;example&#46;com"
    results = extract_emails(html)
    assert len(results) == 1
    assert results[0]["email"] == "contact@example.com"


def test_valid_syntax():
    assert is_valid_email_syntax("info@example.com") is True
    assert is_valid_email_syntax("not-an-email") is False
    assert is_valid_email_syntax("") is False
    assert is_valid_email_syntax("a@b.co") is True


def test_classify_role():
    assert classify_email("info@test.com") == "role_based"
    assert classify_email("john@test.com") == "personal"
    assert classify_email("") == "no_public_email"


def test_dedup_emails():
    html = '<p>info@example.com info@example.com INFO@example.com</p>'
    results = extract_emails(html)
    assert len(results) == 1

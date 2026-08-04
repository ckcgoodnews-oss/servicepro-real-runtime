"""Tests for deduplication logic."""

from service_contacts.deduplication.merge import deduplicate


def test_no_duplicates():
    records = [
        {"company_name": "A Corp", "domain": "acorp.com", "phone": "", "city": "Indy", "state": "IN"},
        {"company_name": "B Corp", "domain": "bcorp.com", "phone": "", "city": "Columbus", "state": "OH"},
    ]
    result = deduplicate(records)
    assert len(result) == 2


def test_domain_dedup():
    records = [
        {"company_name": "Acme Plumbing", "domain": "acmeplumbing.com", "website": "https://acmeplumbing.com", "phone": "", "city": "", "state": "", "email": "info@acmeplumbing.com", "email_is_role_based": True, "source_url": "osm/1", "source_record_id": "a", "service_category": "plumbing"},
        {"company_name": "Acme Plumbing LLC", "domain": "acmeplumbing.com", "website": "http://acmeplumbing.com", "phone": "(317) 555-1234", "city": "Indianapolis", "state": "IN", "email": "", "email_is_role_based": False, "source_url": "osm/2", "source_record_id": "b", "service_category": "plumbing"},
    ]
    result = deduplicate(records)
    assert len(result) == 1
    # Should merge source URLs
    assert "osm/1" in result[0]["source_url"]
    assert "osm/2" in result[0]["source_url"]


def test_phone_dedup():
    records = [
        {"company_name": "Quick Fix", "domain": "", "website": "", "phone": "(317) 555-9999", "city": "Indy", "state": "IN", "source_record_id": "x"},
        {"company_name": "QuickFix Services", "domain": "", "website": "", "phone": "317-555-9999", "city": "Indianapolis", "state": "IN", "source_record_id": "y"},
    ]
    result = deduplicate(records)
    assert len(result) == 1


def test_name_city_state_dedup():
    records = [
        {"company_name": "Bob's HVAC LLC", "domain": "", "website": "", "phone": "", "city": "Dayton", "state": "OH", "source_record_id": "1"},
        {"company_name": "bobs hvac", "domain": "", "website": "", "phone": "", "city": "dayton", "state": "OH", "source_record_id": "2"},
    ]
    result = deduplicate(records)
    assert len(result) == 1


def test_merge_preserves_categories():
    records = [
        {"company_name": "MultiService", "domain": "multi.com", "website": "", "phone": "", "city": "", "state": "", "service_category": "plumbing", "source_url": "", "source_record_id": ""},
        {"company_name": "MultiService Inc", "domain": "multi.com", "website": "", "phone": "", "city": "", "state": "", "service_category": "hvac", "source_url": "", "source_record_id": ""},
    ]
    result = deduplicate(records)
    assert len(result) == 1
    assert "plumbing" in result[0]["service_category"]
    assert "hvac" in result[0]["service_category"]

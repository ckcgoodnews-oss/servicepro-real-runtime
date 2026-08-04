"""Tests for robots.txt handling."""

from unittest.mock import patch, MagicMock

from service_contacts.enrichment.robots import can_fetch, clear_cache


def setup_function():
    clear_cache()


@patch("service_contacts.enrichment.robots.requests.get")
def test_allowed_when_no_disallow(mock_get):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = "User-agent: *\\nAllow: /"
    mock_get.return_value = mock_response

    assert can_fetch("https://example.com/contact") is True


@patch("service_contacts.enrichment.robots.requests.get")
def test_blocked_by_robots(mock_get):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = "User-agent: *\\nDisallow: /"
    mock_get.return_value = mock_response

    assert can_fetch("https://blocked.com/page") is False


@patch("service_contacts.enrichment.robots.requests.get")
def test_404_robots_allows_all(mock_get):
    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_get.return_value = mock_response

    assert can_fetch("https://norobots.com/anything") is True


@patch("service_contacts.enrichment.robots.requests.get")
def test_network_error_allows(mock_get):
    mock_get.side_effect = Exception("Network error")
    assert can_fetch("https://errored.com/page") is True

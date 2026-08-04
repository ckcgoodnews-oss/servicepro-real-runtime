"""Address extraction from HTML."""

import logging
import re

from bs4 import BeautifulSoup

logger = logging.getLogger("service_contacts.address_parser")

# US state abbreviations
US_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
}

# Pattern: street number + street name + city, STATE ZIP
ADDRESS_PATTERN = re.compile(
    r"(\d{1,6}\s+[A-Za-z0-9\s.,'#\-]{3,50})"  # street
    r"[,\s]+"
    r"([A-Za-z\s]{2,30})"  # city
    r"[,\s]+"
    r"([A-Z]{2})"  # state
    r"\s+"
    r"(\d{5}(?:-\d{4})?)",  # zip
    re.MULTILINE,
)


def extract_address(html: str) -> dict | None:
    """Extract a US address from HTML content."""
    if not html:
        return None

    soup = BeautifulSoup(html, "lxml")

    # Try structured address elements first
    address_el = soup.find("address")
    if address_el:
        text = address_el.get_text(separator=" ", strip=True)
        result = _parse_address_text(text)
        if result:
            return result

    # Try schema.org address
    street_el = soup.find(itemprop="streetAddress")
    city_el = soup.find(itemprop="addressLocality")
    state_el = soup.find(itemprop="addressRegion")
    zip_el = soup.find(itemprop="postalCode")

    if street_el and city_el:
        return {
            "street_address": street_el.get_text(strip=True),
            "city": city_el.get_text(strip=True),
            "state": state_el.get_text(strip=True).upper() if state_el else "",
            "postal_code": zip_el.get_text(strip=True) if zip_el else "",
        }

    # Fallback: regex on page text
    text = soup.get_text(separator=" ", strip=True)
    return _parse_address_text(text)


def _parse_address_text(text: str) -> dict | None:
    """Parse address from plain text using regex."""
    match = ADDRESS_PATTERN.search(text)
    if not match:
        return None

    state = match.group(3).upper()
    if state not in US_STATES:
        return None

    return {
        "street_address": match.group(1).strip(),
        "city": match.group(2).strip(),
        "state": state,
        "postal_code": match.group(4).strip(),
    }

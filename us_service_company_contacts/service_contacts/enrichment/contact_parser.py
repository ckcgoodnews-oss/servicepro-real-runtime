"""Extract contacts from crawled HTML pages."""

import logging

from service_contacts.enrichment.address_parser import extract_address
from service_contacts.enrichment.crawler import CrawlResult
from service_contacts.enrichment.email_parser import extract_emails
from service_contacts.enrichment.phone_parser import extract_phones

logger = logging.getLogger("service_contacts.contact_parser")


class ExtractedContacts:
    def __init__(self):
        self.emails: list[dict] = []
        self.phones: list[dict] = []
        self.addresses: list[dict] = []
        self.title: str = ""
        self.organization: str = ""


def parse_contacts(crawl_results: list[CrawlResult]) -> ExtractedContacts:
    """Parse all crawl results and extract contact information."""
    contacts = ExtractedContacts()

    for result in crawl_results:
        if not result.html or result.error:
            continue

        # Extract emails with source URL
        found_emails = extract_emails(result.html)
        for email_info in found_emails:
            email_info["source_url"] = result.final_url or result.url
            contacts.emails.append(email_info)

        # Extract phones
        found_phones = extract_phones(result.html)
        for phone_info in found_phones:
            phone_info["source_url"] = result.final_url or result.url
            contacts.phones.append(phone_info)

        # Extract address from contact/about pages
        if any(p in (result.url or "") for p in ["/contact", "/about", "/location"]):
            address = extract_address(result.html)
            if address:
                contacts.addresses.append(address)

        # Extract title from homepage
        if result.url and result.url.rstrip("/").endswith(("com", "net", "org", "us")) or result.url == "/":
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(result.html[:10000], "lxml")
            title_tag = soup.find("title")
            if title_tag:
                contacts.title = title_tag.get_text(strip=True)[:200]

    return contacts

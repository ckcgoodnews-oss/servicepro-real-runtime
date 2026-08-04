"""Deduplication and record merging."""

import logging
from collections import defaultdict

from service_contacts.utils.normalization import normalize_company_name, normalize_domain, normalize_phone_for_dedup

logger = logging.getLogger("service_contacts.deduplication")


def deduplicate(records: list[dict]) -> list[dict]:
    """
    Deduplicate company records using priority:
    1. Normalized domain
    2. Normalized phone
    3. Normalized company name + city + state
    4. Source record ID

    When duplicates conflict:
    - Retain all source URLs (semicolon-separated)
    - Prefer newer checks
    - Prefer data from company website
    - Preserve most complete address
    - Preserve multiple categories (semicolon-separated)
    """
    # Build groups by various keys
    domain_groups: dict[str, list[int]] = defaultdict(list)
    phone_groups: dict[str, list[int]] = defaultdict(list)
    name_groups: dict[str, list[int]] = defaultdict(list)

    for idx, record in enumerate(records):
        domain = normalize_domain(record.get("domain", "") or record.get("website", ""))
        if domain:
            domain_groups[domain].append(idx)

        phone = normalize_phone_for_dedup(record.get("phone", ""))
        if phone:
            phone_groups[phone].append(idx)

        name_key = _name_location_key(record)
        if name_key:
            name_groups[name_key].append(idx)

    # Union-find to group duplicates
    parent = list(range(len(records)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    for group in domain_groups.values():
        for i in range(1, len(group)):
            union(group[0], group[i])

    for group in phone_groups.values():
        for i in range(1, len(group)):
            union(group[0], group[i])

    for group in name_groups.values():
        for i in range(1, len(group)):
            union(group[0], group[i])

    # Collect merged groups
    clusters: dict[int, list[int]] = defaultdict(list)
    for idx in range(len(records)):
        clusters[find(idx)].append(idx)

    # Merge each cluster
    merged = []
    for indices in clusters.values():
        if len(indices) == 1:
            merged.append(records[indices[0]])
        else:
            merged.append(_merge_records([records[i] for i in indices]))

    logger.info(f"Deduplicated {len(records)} → {len(merged)} records")
    return merged


def _name_location_key(record: dict) -> str:
    """Generate a dedup key from name + city + state."""
    name = normalize_company_name(record.get("company_name", ""))
    city = (record.get("city", "") or "").lower().strip()
    state = (record.get("state", "") or "").upper().strip()
    if name and city and state:
        return f"{name}|{city}|{state}"
    return ""


def _merge_records(records: list[dict]) -> dict:
    """Merge duplicate records, preferring most complete data."""
    # Sort by date (newer first) and completeness
    records.sort(key=lambda r: (
        r.get("date_verified", "") or r.get("date_collected", "") or "",
        _completeness_score(r),
    ), reverse=True)

    base = dict(records[0])

    # Merge categories
    categories: set[str] = set()
    for r in records:
        cat = r.get("service_category", "")
        if cat:
            categories.update(c.strip() for c in cat.split(";"))
    if categories:
        base["service_category"] = ";".join(sorted(categories))

    # Merge source URLs
    sources: set[str] = set()
    for r in records:
        src = r.get("source_url", "")
        if src:
            sources.update(s.strip() for s in src.split(";"))
    if sources:
        base["source_url"] = ";".join(sorted(sources))

    # Prefer most complete address
    for r in records:
        if r.get("street_address") and r.get("city") and r.get("state") and r.get("postal_code"):
            base["street_address"] = r["street_address"]
            base["city"] = r["city"]
            base["state"] = r["state"]
            base["postal_code"] = r["postal_code"]
            break

    # Prefer role-based email
    for r in records:
        if r.get("email_is_role_based"):
            base["email"] = r["email"]
            base["email_is_role_based"] = True
            base["email_source_url"] = r.get("email_source_url", "")
            break

    # Track merge
    base["merged_from"] = ";".join(r.get("source_record_id", "") for r in records if r.get("source_record_id"))
    base["notes"] = f"Merged from {len(records)} records"

    return base


def _completeness_score(record: dict) -> int:
    """Count how many fields are populated."""
    fields = ["company_name", "website", "email", "phone", "street_address", "city", "state", "postal_code"]
    return sum(1 for f in fields if record.get(f))

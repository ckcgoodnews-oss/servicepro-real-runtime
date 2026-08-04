"""CSV export with required column order."""

import logging
from pathlib import Path

import pandas as pd

logger = logging.getLogger("service_contacts.exporter")

# Required CSV columns in exact order
CSV_COLUMNS = [
    "company_name",
    "service_category",
    "service_subcategory",
    "website",
    "website_final_url",
    "website_status",
    "website_http_status",
    "domain",
    "domain_has_dns",
    "domain_has_mx",
    "email",
    "email_source_url",
    "email_is_public",
    "email_is_role_based",
    "email_syntax_valid",
    "email_domain_matches_website",
    "email_domain_has_mx",
    "email_verification_status",
    "phone",
    "phone_e164",
    "phone_valid",
    "street_address",
    "city",
    "state",
    "postal_code",
    "country",
    "source_name",
    "source_url",
    "source_record_id",
    "date_collected",
    "date_verified",
    "robots_allowed",
    "confidence_score",
    "notes",
]


def export_csv(
    records: list[dict],
    output_path: str = "service_companies.csv",
    only_with_email: bool = False,
    only_with_phone: bool = False,
    minimum_confidence: int = 0,
) -> Path:
    """Export records to CSV with required column order and filters."""
    df = pd.DataFrame(records)

    # Apply filters
    if only_with_email:
        df = df[df["email"].notna() & (df["email"] != "")]
    if only_with_phone:
        df = df[df["phone"].notna() & (df["phone"] != "")]
    if minimum_confidence > 0:
        df = df[df["confidence_score"] >= minimum_confidence]

    # Ensure all required columns exist
    for col in CSV_COLUMNS:
        if col not in df.columns:
            df[col] = ""

    # Reorder and export
    df = df[CSV_COLUMNS]
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output, index=False, encoding="utf-8-sig")

    logger.info(f"Exported {len(df)} records to {output}")
    return output

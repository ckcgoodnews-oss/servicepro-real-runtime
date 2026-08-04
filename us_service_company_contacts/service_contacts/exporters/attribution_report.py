"""Source attribution report generator."""

import json
import logging
from collections import Counter
from datetime import datetime
from pathlib import Path

logger = logging.getLogger("service_contacts.attribution")


def generate_attribution_report(records: list[dict], output_dir: str = "data") -> Path:
    """Generate a source attribution report."""
    source_counts = Counter(r.get("source_name", "unknown") for r in records)
    state_counts = Counter(r.get("state", "??") for r in records)
    category_counts = Counter(r.get("service_category", "unknown") for r in records)

    report = {
        "generated_at": datetime.utcnow().isoformat(),
        "total_records": len(records),
        "sources": dict(source_counts.most_common()),
        "states": dict(state_counts.most_common()),
        "categories": dict(category_counts.most_common()),
        "attribution": [
            {
                "source": "OpenStreetMap Overpass API",
                "url": "https://overpass-api.de/",
                "license": "ODbL 1.0 (OpenStreetMap contributors)",
                "attribution_text": "Data © OpenStreetMap contributors, available under ODbL.",
            }
        ],
    }

    output = Path(output_dir) / "attribution_report.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2))

    logger.info(f"Attribution report saved to {output}")
    return output

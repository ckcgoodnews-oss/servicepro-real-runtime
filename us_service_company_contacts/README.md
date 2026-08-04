# US Service Company Contacts

A command-line application that collects publicly listed U.S. service company business contact information from open data sources.

## Legal and Ethical Notice

**Users are responsible for complying with all applicable laws, provider terms of service, and data protection regulations.**

This tool:
- Only collects publicly displayed business contact information
- Does NOT collect private personal information
- Does NOT perform SMTP probing, credential testing, or CAPTCHA bypassing
- Respects robots.txt on all crawled websites
- Rate-limits all requests to avoid overloading servers
- Prefers role-based business addresses (info@, contact@, etc.)

A passing DNS/MX check confirms only that a domain is configured to receive email. It does NOT prove any specific mailbox exists.

## Data Sources

| Source | License | Notes |
|--------|---------|-------|
| OpenStreetMap Overpass API | ODbL 1.0 | Data © OpenStreetMap contributors |

Attribution: Data derived from OpenStreetMap is available under the Open Database License.

## Installation

### Windows (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
python -m service_contacts --help
```

### Linux/macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
python -m service_contacts --help
```

## Configuration

1. Copy `.env.example` to `.env`
2. Set `ADMIN_CONTACT_EMAIL` to your email (used in User-Agent)
3. Adjust rate limits in `.env` or `config.yaml` as needed

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `USER_AGENT` | ServiceContactsBot/1.0 | HTTP User-Agent string |
| `ADMIN_CONTACT_EMAIL` | admin@example.com | Contact email in User-Agent |
| `DATABASE_URL` | sqlite:///data/service_contacts.db | SQLite database path |
| `OVERPASS_ENDPOINT` | https://overpass-api.de/api/interpreter | Overpass API URL |
| `OVERPASS_FALLBACK_ENDPOINTS` | Kumi, NCHC | Comma-separated fallback endpoints tried in order |
| `OVERPASS_TIMEOUT` | 60 | Per-attempt Overpass timeout in seconds |
| `HTTP_TIMEOUT` | 30 | Request timeout (seconds) |
| `REQUESTS_PER_SECOND` | 0.5 | Max requests per second per domain |
| `MAX_WORKERS` | 5 | Concurrent workers |
| `MAX_PAGES_PER_DOMAIN` | 5 | Max pages crawled per website |

## Usage

### Quick Start

```bash
# Collect businesses in Indiana, Ohio, Kentucky (plumbing, HVAC, electrician)
python -m service_contacts collect --states IN,OH,KY --categories plumbing,hvac,electrician --limit 500

# Enrich with website data
python -m service_contacts enrich

# Verify websites, DNS, email, phone
python -m service_contacts verify

# Export to CSV
python -m service_contacts export --output my_contacts.csv
```

### Full Pipeline

```bash
# Run everything in one command
python -m service_contacts run --states IN,OH --categories plumbing,hvac --limit 1000 --timeout 60 --output results.csv
```

### All Commands

```bash
python -m service_contacts collect --states IN,OH,KY --categories plumbing,hvac,electrician --limit 5000
python -m service_contacts enrich --workers 5
python -m service_contacts verify
python -m service_contacts export --output service_companies.csv
python -m service_contacts run --states ALL --categories ALL --limit 100000 --output service_companies.csv
python -m service_contacts stats
python -m service_contacts resume
```

### Options

| Option | Description |
|--------|-------------|
| `--states` | Comma-separated state codes (e.g., IN,OH,KY) or ALL |
| `--categories` | Comma-separated categories or ALL |
| `--limit` | Maximum records to collect |
| `--workers` | Concurrent enrichment workers |
| `--timeout` | Overpass timeout per attempt in seconds (collect and run; default 60) |
| `--output` | Output CSV file path |
| `--only-with-email` | Export only records with email |
| `--only-with-phone` | Export only records with phone |
| `--minimum-confidence` | Minimum confidence score (0-100) |
| `--dry-run` | Show plan without making network requests |
| `--resume` | Resume interrupted run |

### Dry Run

```bash
python -m service_contacts collect --states ALL --categories ALL --limit 10000 --dry-run
```

### Run Artifacts

Collection always refreshes `data/failed_records.csv`. It contains one row per failed provider/state/category query and remains header-only when there are no failures. A full `run` also writes `data/run_summary.json` with inputs, UTC timestamps, duration, stage counts, output path, and final status (`completed`, `completed_with_failures`, `dry_run`, or `failed`). These operational artifacts are ignored by Git.

## CSV Output Format

The exported CSV contains 34 columns in this exact order:

1. company_name
2. service_category
3. service_subcategory
4. website
5. website_final_url
6. website_status
7. website_http_status
8. domain
9. domain_has_dns
10. domain_has_mx
11. email
12. email_source_url
13. email_is_public
14. email_is_role_based
15. email_syntax_valid
16. email_domain_matches_website
17. email_domain_has_mx
18. email_verification_status
19. phone
20. phone_e164
21. phone_valid
22. street_address
23. city
24. state
25. postal_code
26. country
27. source_name
28. source_url
29. source_record_id
30. date_collected
31. date_verified
32. robots_allowed
33. confidence_score
34. notes

## Verification Explained

### Website Verification
Checks HTTP status and follows redirects. Statuses: active, redirected, inaccessible, blocked_by_robots, timeout, invalid.

### Domain/DNS Verification
Performs DNS A/AAAA record lookup and MX record check. Does NOT contact mail servers.

### Email Verification
Validates syntax, checks if role-based (info@, contact@, etc.), confirms domain has MX records, and checks domain match against company website.

**Important:** DNS/MX verification does NOT prove a mailbox exists. It only confirms the domain is configured to potentially receive email.

### Phone Verification
Normalizes to E.164 format using the `phonenumbers` library. Validates against US numbering plan.

### Confidence Score
Transparent 0-100 score based on data completeness. High score does NOT mean "verified" — it means more data points are present and validated.

## Resuming Interrupted Runs

If a collection or enrichment run is interrupted:

```bash
python -m service_contacts resume
```

This picks up unprocessed source records and unverified companies.

## Changing Categories

See `service_contacts/categories.py` for the full list of 36 supported service categories. Use any combination in the `--categories` flag:

```bash
python -m service_contacts collect --categories plumbing,roofing,pest_control,landscaping
```

## Rate Limits

Default settings are conservative:
- 0.5 requests/second per domain (1 request every 2 seconds)
- Maximum 5 pages per domain
- Maximum 5 concurrent workers
- 3 retry attempts with exponential backoff
- Never retries 401, 403, 404, or robots.txt blocks

Adjust in `.env` if source APIs have stricter or more lenient limits.

## Development

```bash
pip install -e ".[dev]"
pytest
ruff check .
mypy service_contacts/
```

## License

MIT

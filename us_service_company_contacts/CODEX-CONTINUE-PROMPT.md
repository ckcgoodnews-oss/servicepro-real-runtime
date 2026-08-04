# Codex Continuation Prompt — US Service Company Contacts

You are continuing development of the `us_service_company_contacts` Python CLI application located at `D:\ServiceRepo\us_service_company_contacts\`.

## Git State

```bash
# Always start by syncing with remote
cd D:\ServiceRepo
git pull --rebase origin main

# If conflicts with untracked files:
git clean -fd apps/web/public/documentation/
git rebase --continue
# OR if rebase is stuck:
git rebase --abort
git pull --rebase origin main

# After work is done:
git add us_service_company_contacts/
git commit -m "feat(contacts): <description>"
git push origin main
```

**Current remote branch:** `main`  
**Last known commit:** `ee5fa98`  
**Repository:** `https://github.com/ckcgoodnews-oss/servicepro-real-runtime.git`

## Project Location

```
D:\ServiceRepo\us_service_company_contacts/
├── .env.example
├── .gitignore
├── README.md
├── config.yaml
├── pyproject.toml
├── requirements.txt
├── service_contacts/
│   ├── __init__.py
│   ├── __main__.py
│   ├── cli.py
│   ├── config.py
│   ├── database.py
│   ├── logging_config.py
│   ├── categories.py
│   ├── models.py
│   ├── providers/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── overpass.py
│   │   └── public_directory.py
│   ├── enrichment/
│   │   ├── __init__.py
│   │   ├── robots.py
│   │   ├── crawler.py
│   │   ├── contact_parser.py
│   │   ├── email_parser.py
│   │   ├── phone_parser.py
│   │   └── address_parser.py
│   ├── verification/
│   │   ├── __init__.py
│   │   ├── website.py
│   │   ├── dns.py
│   │   ├── email.py
│   │   ├── phone.py
│   │   └── scoring.py
│   ├── deduplication/
│   │   ├── __init__.py
│   │   └── merge.py
│   ├── exporters/
│   │   ├── __init__.py
│   │   ├── csv_exporter.py
│   │   └── attribution_report.py
│   └── utils/
│       ├── __init__.py
│       ├── normalization.py
│       ├── rate_limit.py
│       └── retry.py
└── tests/
    ├── __init__.py
    ├── test_email_parser.py
    ├── test_phone_parser.py
    ├── test_deduplication.py
    ├── test_scoring.py
    ├── test_robots.py
    └── fixtures/
```

## Current Status

### What Works
- All 30 unit tests pass (0.41s)
- CLI dry-run works: `python -m service_contacts collect --dry-run`
- Stats command works: `python -m service_contacts stats`
- Full pipeline confirmed with simulated data (seed → enrich → verify → dedup → export)
- CSV output has all 34 required columns in exact order
- SQLite database initializes correctly
- Confidence scoring (0-100) works correctly
- Deduplication merges by domain, phone, or name+city+state
- robots.txt compliance verified via mocks

### Known Issues / Incomplete Items
1. **Overpass API timeouts** — The public Overpass API (`overpass-api.de`) times out from some networks. Consider adding a fallback endpoint or retry with longer timeout.
2. **No async support** — All HTTP requests are synchronous. Adding `httpx` async client for parallel enrichment would significantly speed up large runs.
3. **Public directory providers** — The `public_directory.py` is a stub interface. No state-level directories are implemented yet.
4. **No Playwright integration** — For JS-rendered sites, Playwright is listed as optional but not implemented.
5. **No failed record CSV** — The spec requires a `failed_records.csv` export for records that couldn't be processed.
6. **No run summary JSON** — The spec requires a JSON summary after each run.
7. **datetime.utcnow() deprecation** — Python 3.12+ warns about this. Replace with `datetime.now(datetime.UTC)`.

## What To Build Next

### Priority 1: Fix and Harden
- Replace `datetime.utcnow()` with `datetime.now(datetime.UTC)` throughout
- Add alternate Overpass endpoints (e.g., `https://overpass.kumi.systems/api/interpreter`)
- Add connection retry with longer initial timeout (60s for Overpass)
- Add `--timeout` CLI option

### Priority 2: Missing Deliverables
- Add failed records CSV export (`data/failed_records.csv`)
- Add run summary JSON (`data/run_summary.json`) after each pipeline run
- Add `ruff` linting pass and fix any issues
- Add `mypy` type checking pass

### Priority 3: Performance
- Add async enrichment using `httpx.AsyncClient`
- Add connection pooling for concurrent website verification
- Implement proper `--workers` parallelism using `concurrent.futures`

### Priority 4: Additional Providers
- Implement at least one public directory provider (e.g., state SOS business registrations)
- Add Google Places API provider (optional, requires API key)

## Environment Setup

```powershell
cd D:\ServiceRepo\us_service_company_contacts
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install pytest pytest-mock responses ruff mypy
cp .env.example .env
# Edit .env: set ADMIN_CONTACT_EMAIL to your email
```

## Running

```bash
# Tests
python -m pytest tests/ -v

# Lint
ruff check service_contacts/

# Type check
mypy service_contacts/

# Dry run
python -m service_contacts collect --states IN --categories plumbing --limit 10 --dry-run

# Real collection (requires Overpass API access)
python -m service_contacts run --states IN,OH --categories plumbing,hvac --limit 200 --output results.csv

# Stats
python -m service_contacts stats
```

## Key Design Decisions
- Uses SQLAlchemy ORM with SQLite for staging and resume
- Repository factory pattern auto-discovers providers
- Dual JSON/Postgres mode in ServicePro repo (this project uses SQLite only)
- Rate limiting: 0.5 req/sec per domain, max 5 pages per domain
- Never retries 401, 403, 404, or robots.txt blocks
- Confidence score is transparent (not a "verified" label)
- DNS/MX check ≠ mailbox verification (documented clearly)
- All email extraction records `source_url` for attribution
- Dedup priority: domain > phone > name+city+state > source_record_id

## Commit Conventions
```
feat(contacts): add async enrichment with httpx
fix(contacts): handle Overpass timeout gracefully
chore(contacts): replace deprecated utcnow calls
test(contacts): add integration test for full pipeline
docs(contacts): update README with alternate endpoints
```

## Do NOT
- Do not modify files outside `us_service_company_contacts/`
- Do not commit `.env`, `data/`, `logs/`, or `.venv/`
- Do not perform SMTP probing or mailbox verification
- Do not bypass robots.txt
- Do not collect personal email addresses (role-based only preferred)
- Do not add proxy rotation, CAPTCHA bypass, or anti-bot evasion

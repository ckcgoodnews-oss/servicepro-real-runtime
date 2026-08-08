"""CLI interface using Typer."""

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, cast

import typer
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table

from service_contacts.categories import ALL_CATEGORY_NAMES, ALL_STATES
from service_contacts.config import DATA_DIR
from service_contacts.database import get_session, init_db
from service_contacts.deduplication.merge import deduplicate
from service_contacts.enrichment.contact_parser import parse_contacts
from service_contacts.enrichment.crawler import crawl_website
from service_contacts.exporters.attribution_report import generate_attribution_report
from service_contacts.exporters.csv_exporter import export_csv
from service_contacts.exporters.run_artifacts import export_failed_records, export_run_summary
from service_contacts.logging_config import setup_logging
from service_contacts.models import Company, ExportRun, SourceRecord
from service_contacts.providers.overpass import OverpassProvider
from service_contacts.verification.dns import verify_domain
from service_contacts.verification.email import verify_email
from service_contacts.verification.phone import verify_phone
from service_contacts.verification.scoring import calculate_confidence
from service_contacts.verification.website import verify_website

app = typer.Typer(
    name="service-contacts",
    help="Collect publicly listed U.S. service company contact information.",
    no_args_is_help=True,
)
console = Console()


def parse_list(value: str) -> list[str]:
    """Parse comma-separated string to list."""
    if value.upper() == "ALL":
        return []  # Signal to use all
    return [v.strip().lower() for v in value.split(",") if v.strip()]


@app.command()
def collect(
    states: str = typer.Option("IN,OH,KY", help="Comma-separated state codes or ALL"),
    categories: str = typer.Option("plumbing,hvac,electrician", help="Comma-separated categories or ALL"),
    limit: int = typer.Option(5000, help="Maximum records to collect"),
    dry_run: bool = typer.Option(False, help="Show what would be collected without network requests"),
    timeout: int = typer.Option(60, min=1, help="Overpass request timeout in seconds"),
    tile_size: float = typer.Option(0.5, help="Geographic tile size in degrees"),
    requests_per_second: float = typer.Option(0.4, help="Max requests per second to Overpass"),
    resume: bool = typer.Option(False, "--resume", help="Resume from last checkpoint"),
):
    """Collect business records from data sources with tile-level checkpointing."""
    setup_logging()
    engine = init_db()
    session = get_session(engine)

    from service_contacts.models import CrawlQueue
    from service_contacts.providers.geo_tiles import generate_tiles, tile_key
    from service_contacts.categories import CATEGORIES, US_STATE_BOUNDS
    import service_contacts.config as cfg

    # Override config with CLI values
    cfg.REQUESTS_PER_SECOND = requests_per_second
    cfg.OVERPASS_TIMEOUT = timeout

    state_list = parse_list(states) or ALL_STATES
    cat_list = parse_list(categories) or ALL_CATEGORY_NAMES

    console.print(f"[bold]Collecting from {len(state_list)} states, {len(cat_list)} categories, limit {limit}[/bold]")
    console.print(f"  Tile size: {tile_size}°, timeout: {timeout}s, rate: {requests_per_second} req/s")

    if dry_run:
        console.print("[yellow]DRY RUN — no network requests will be made[/yellow]")
        total_tiles = 0
        for st in state_list:
            bounds = US_STATE_BOUNDS.get(st.upper())
            if bounds:
                total_tiles += len(generate_tiles(bounds, tile_size))
        console.print(f"  States: {', '.join(state_list[:10])}{'...' if len(state_list) > 10 else ''}")
        console.print(f"  Categories: {', '.join(cat_list[:10])}{'...' if len(cat_list) > 10 else ''}")
        console.print(f"  Total tiles: {total_tiles} (one combined query per tile, all categories classified locally)")
        return 0, 0

    # Build or resume work queue
    if resume:
        pending = session.query(CrawlQueue).filter(CrawlQueue.status.in_(["pending", "failed"])).count()
        if pending > 0:
            console.print(f"[cyan]Resuming: {pending} pending/failed tiles in queue[/cyan]")
        else:
            console.print("[cyan]No pending tiles found — rebuilding queue[/cyan]")
            resume = False  # Fall through to queue build below

    if not resume:
        # Clear old queue and rebuild — ONE entry per geographic tile (combined query)
        session.query(CrawlQueue).delete()
        session.commit()
        for st in state_list:
            bounds = US_STATE_BOUNDS.get(st.upper())
            if not bounds:
                continue
            tiles = generate_tiles(bounds, tile_size)
            for idx, tile_bounds_item in enumerate(tiles):
                bbox_str = f"{tile_bounds_item[0]:.4f},{tile_bounds_item[1]:.4f},{tile_bounds_item[2]:.4f},{tile_bounds_item[3]:.4f}"
                session.add(CrawlQueue(
                    state=st.upper(),
                    category="ALL",
                    tile_index=idx,
                    tile_bounds=bbox_str,
                    status="pending",
                ))
        session.commit()

    # Process queue with combined multi-category queries
    provider = OverpassProvider(timeout=timeout, tile_size=tile_size)
    provider.set_rate(requests_per_second)
    count = 0
    completed_tiles = 0
    failed_tiles = 0

    pending_items = session.query(CrawlQueue).filter(
        CrawlQueue.status.in_(["pending", "failed"])
    ).filter(CrawlQueue.attempts < 3).all()

    console.print(f"[bold]Processing {len(pending_items)} geographic tiles (combined queries)...[/bold]")

    requested_categories = set(cat_list) if cat_list else set(CATEGORIES.keys())

    for item in pending_items:
        if count >= limit:
            break

        # Parse tile bounds
        parts = item.tile_bounds.split(",")
        if len(parts) != 4:
            item.status = "skipped"
            session.commit()
            continue
        tile_bounds = tuple(float(p) for p in parts)

        item.status = "running"
        item.attempts = (item.attempts or 0) + 1
        item.last_attempt_at = datetime.now(UTC)
        session.commit()

        try:
            from service_contacts.providers.overpass import classify_element
            elements = provider._query_tile_combined(item.state, tile_bounds)

            tile_records = 0
            for element in elements:
                if count >= limit:
                    break
                tags = element.get("tags", {})
                name = tags.get("name", "").strip()
                if not name:
                    continue
                category = classify_element(tags, requested_categories)
                if not category:
                    continue

                lat = element.get("lat") or element.get("center", {}).get("lat")
                lon = element.get("lon") or element.get("center", {}).get("lon")
                session.add(SourceRecord(
                    source_name="openstreetmap_overpass",
                    source_url=f"https://www.openstreetmap.org/{element.get('type', 'node')}/{element.get('id', '')}",
                    source_record_id=f"osm_{element.get('type', 'node')}_{element.get('id', '')}",
                    company_name=name,
                    service_category=category,
                    website=tags.get("website", tags.get("contact:website", "")),
                    email=tags.get("email", tags.get("contact:email", "")),
                    phone=tags.get("phone", tags.get("contact:phone", "")),
                    street_address=OverpassProvider._build_address(tags),
                    city=tags.get("addr:city", ""),
                    state=item.state,
                    postal_code=tags.get("addr:postcode", ""),
                    country="US",
                    latitude=lat,
                    longitude=lon,
                    raw_data=json.dumps(tags),
                    date_collected=datetime.now(UTC),
                    processed=False,
                ))
                count += 1
                tile_records += 1

            item.status = "completed"
            item.records_found = tile_records
            item.completed_at = datetime.now(UTC)
            completed_tiles += 1
            session.commit()

            if tile_records > 0:
                console.print(f"  [green]OK[/green] {item.state} tile {item.tile_index}: {tile_records} records (total: {count})")

        except Exception as e:
            item.status = "failed"
            item.error = str(e)[:500]
            failed_tiles += 1
            session.commit()

    session.close()
    export_failed_records(provider.failures, DATA_DIR / "failed_records.csv")
    console.print(f"[green]✓ Collected {count} records ({completed_tiles} tiles OK, {failed_tiles} failed)[/green]")
    return count, failed_tiles


@app.command()
def enrich(
    workers: int = typer.Option(5, help="Concurrent workers"),
    resume: bool = typer.Option(False, help="Resume from last position"),
):
    """Enrich collected records with website data and contacts."""
    setup_logging()
    engine = init_db()
    session = get_session(engine)

    # Get unprocessed source records
    records = session.query(SourceRecord).filter(SourceRecord.processed.is_(False)).limit(1000).all()
    console.print(f"[bold]Enriching {len(records)} records[/bold]")

    enriched_count = 0
    for record in records:
        if not record.website:
            record.processed = True  # type: ignore[assignment]
            continue

        console.print(f"  Crawling: {record.website[:60]}...")

        # Crawl website
        crawl_results = crawl_website(cast(str, record.website))
        contacts = parse_contacts(crawl_results)

        # Create/update company record
        company = Company(
            company_name=record.company_name,
            service_category=record.service_category,
            service_subcategory=record.service_subcategory or "",
            website=record.website,
            email=contacts.emails[0]["email"] if contacts.emails else record.email,
            email_source_url=contacts.emails[0].get("source_url", "") if contacts.emails else "",
            phone=contacts.phones[0]["phone"] if contacts.phones else record.phone,
            phone_source="website" if contacts.phones else "source_data",
            street_address=record.street_address,
            city=record.city,
            state=record.state,
            postal_code=record.postal_code,
            country=record.country,
            source_name=record.source_name,
            source_url=record.source_url,
            source_record_id=record.source_record_id,
            date_collected=record.date_collected,
        )

        # Update from contacts
        if contacts.addresses:
            addr = contacts.addresses[0]
            company.street_address = addr.get("street_address", company.street_address)
            company.city = addr.get("city", company.city)
            company.state = addr.get("state", company.state)
            company.postal_code = addr.get("postal_code", company.postal_code)

        session.add(company)
        record.processed = True  # type: ignore[assignment]
        enriched_count += 1

        if enriched_count % 10 == 0:
            session.commit()

    session.commit()
    session.close()
    console.print(f"[green]✓ Enriched {enriched_count} records[/green]")
    return enriched_count


@app.command()
def verify():
    """Verify websites, DNS, email, and phone for all companies."""
    setup_logging()
    engine = init_db()
    session = get_session(engine)

    companies = session.query(Company).filter(Company.date_verified.is_(None)).limit(500).all()
    console.print(f"[bold]Verifying {len(companies)} companies[/bold]")

    for company in companies:
        # Website verification
        if company.website:
            web_result = verify_website(company.website)
            company.website_status = web_result["website_status"]
            company.website_http_status = web_result["website_http_status"]
            company.website_final_url = web_result["website_final_url"]
            company.robots_allowed = web_result["robots_allowed"]

        # Domain verification
        domain_result = verify_domain(company.website or "")
        company.domain = domain_result["domain"]
        company.domain_has_dns = domain_result["domain_has_dns"]
        company.domain_has_mx = domain_result["domain_has_mx"]

        # Email verification
        if company.email:
            email_result = verify_email(company.email, company.domain)
            company.email_is_public = email_result["email_is_public"]
            company.email_is_role_based = email_result["email_is_role_based"]
            company.email_syntax_valid = email_result["email_syntax_valid"]
            company.email_domain_matches_website = email_result["email_domain_matches_website"]
            company.email_domain_has_mx = email_result["email_domain_has_mx"]
            company.email_verification_status = email_result["email_verification_status"]

        # Phone verification
        if company.phone:
            phone_result = verify_phone(company.phone)
            company.phone_e164 = phone_result["phone_e164"]
            company.phone_valid = phone_result["phone_valid"]

        # Confidence score
        company_dict = {c.name: getattr(company, c.name) for c in company.__table__.columns}
        company.confidence_score = calculate_confidence(company_dict)
        company.date_verified = datetime.now(UTC)

    session.commit()
    session.close()
    console.print(f"[green]✓ Verified {len(companies)} companies[/green]")
    return len(companies)


@app.command()
def export(
    output: str = typer.Option("service_companies.csv", help="Output CSV path"),
    only_with_email: bool = typer.Option(False, help="Only export records with email"),
    only_with_phone: bool = typer.Option(False, help="Only export records with phone"),
    minimum_confidence: int = typer.Option(0, help="Minimum confidence score"),
):
    """Export verified companies to CSV."""
    setup_logging()
    engine = init_db()
    session = get_session(engine)

    companies = session.query(Company).all()
    records = []
    for c in companies:
        record = {col.name: getattr(c, col.name) for col in c.__table__.columns}
        records.append(record)

    # Deduplicate
    merged = deduplicate(records)

    # Export
    result_path = export_csv(merged, output, only_with_email, only_with_phone, minimum_confidence)

    # Attribution report
    generate_attribution_report(merged)

    # Log export run
    export_run = ExportRun(filename=str(result_path), record_count=len(merged))
    session.add(export_run)
    session.commit()
    session.close()

    console.print(f"[green]✓ Exported {len(merged)} records to {result_path}[/green]")
    return len(merged)


@app.command()
def run(
    states: str = typer.Option("IN,OH,KY", help="Comma-separated state codes or ALL"),
    categories: str = typer.Option("plumbing,hvac,electrician", help="Comma-separated categories or ALL"),
    limit: int = typer.Option(5000, help="Maximum records"),
    output: str = typer.Option("service_companies.csv", help="Output CSV path"),
    workers: int = typer.Option(5, help="Concurrent workers"),
    dry_run: bool = typer.Option(False, help="Dry run only"),
    timeout: int = typer.Option(60, min=1, help="Overpass request timeout in seconds"),
    tile_size: float = typer.Option(0.5, help="Geographic tile size in degrees"),
    requests_per_second: float = typer.Option(0.4, help="Max requests per second"),
    resume: bool = typer.Option(False, "--resume", help="Resume from last checkpoint"),
):
    """Run full pipeline: collect → enrich → verify → export."""
    console.print("[bold]Running full pipeline[/bold]")
    started_at = datetime.now(UTC)
    summary: dict[str, Any] = {
        "status": "running",
        "started_at": started_at.isoformat(),
        "inputs": {"states": states, "categories": categories, "limit": limit, "workers": workers, "timeout": timeout, "tile_size": tile_size},
        "output": output,
        "counts": {"collected": 0, "failed": 0, "enriched": 0, "verified": 0, "exported": 0},
    }
    try:
        collected, failed = collect(
            states=states, categories=categories, limit=limit, dry_run=dry_run,
            timeout=timeout, tile_size=tile_size, requests_per_second=requests_per_second, resume=resume
        )
        summary["counts"]["collected"] = collected
        summary["counts"]["failed"] = failed
        if dry_run:
            summary["status"] = "dry_run"
            return
        summary["counts"]["enriched"] = enrich(workers=workers, resume=False)
        summary["counts"]["verified"] = verify()
        summary["counts"]["exported"] = export(
            output=output,
            only_with_email=False,
            only_with_phone=False,
            minimum_confidence=0,
        )
        summary["status"] = "completed_with_failures" if failed else "completed"
    except Exception as exc:
        summary["status"] = "failed"
        summary["error"] = {"type": type(exc).__name__, "message": str(exc)}
        raise
    finally:
        finished_at = datetime.now(UTC)
        summary["finished_at"] = finished_at.isoformat()
        summary["duration_seconds"] = round((finished_at - started_at).total_seconds(), 3)
        summary_path = export_run_summary(summary, DATA_DIR / "run_summary.json")
        console.print(f"[cyan]Run summary: {summary_path}[/cyan]")


@app.command()
def stats():
    """Show database statistics."""
    setup_logging()
    engine = init_db()
    session = get_session(engine)

    source_count = session.query(SourceRecord).count()
    company_count = session.query(Company).count()
    verified_count = session.query(Company).filter(Company.date_verified.is_not(None)).count()
    with_email = session.query(Company).filter(Company.email != "", Company.email.is_not(None)).count()
    with_phone = session.query(Company).filter(Company.phone != "", Company.phone.is_not(None)).count()

    table = Table(title="Database Statistics")
    table.add_column("Metric", style="cyan")
    table.add_column("Count", style="green", justify="right")
    table.add_row("Source records", str(source_count))
    table.add_row("Companies", str(company_count))
    table.add_row("Verified", str(verified_count))
    table.add_row("With email", str(with_email))
    table.add_row("With phone", str(with_phone))

    console.print(table)
    session.close()


@app.command()
def resume():
    """Resume collection from last checkpoint, then enrich and verify."""
    setup_logging()
    console.print("[bold]Resuming from last checkpoint...[/bold]")

    engine = init_db()
    session = get_session(engine)
    from service_contacts.models import CrawlQueue

    pending = session.query(CrawlQueue).filter(CrawlQueue.status.in_(["pending", "failed"])).filter(CrawlQueue.attempts < 3).count()
    completed = session.query(CrawlQueue).filter(CrawlQueue.status == "completed").count()
    session.close()

    console.print(f"  Queue: {pending} pending/retryable, {completed} already completed")

    if pending > 0:
        collect(states="ALL", categories="ALL", limit=5000, dry_run=False, timeout=60, tile_size=0.5, requests_per_second=0.4, resume=True)

    enrich(workers=5, resume=True)
    verify()
    console.print("[green]✓ Resume complete[/green]")


@app.command(name="failed-units")
def failed_units():
    """Show failed collection tiles that can be retried."""
    setup_logging()
    engine = init_db()
    session = get_session(engine)
    from service_contacts.models import CrawlQueue

    failed = session.query(CrawlQueue).filter(CrawlQueue.status == "failed").all()

    if not failed:
        console.print("[green]No failed tiles.[/green]")
        session.close()
        return

    table = Table(title=f"Failed Tiles ({len(failed)})")
    table.add_column("State", style="cyan")
    table.add_column("Category")
    table.add_column("Tile")
    table.add_column("Attempts", justify="right")
    table.add_column("Error")

    for item in failed[:50]:
        table.add_row(item.state, item.category, str(item.tile_index), str(item.attempts), (item.error or "")[:60])

    console.print(table)
    session.close()


@app.command(name="retry-failed")
def retry_failed():
    """Reset failed tiles to pending and resume collection."""
    setup_logging()
    engine = init_db()
    session = get_session(engine)
    from service_contacts.models import CrawlQueue

    reset_count = session.query(CrawlQueue).filter(CrawlQueue.status == "failed").update({"status": "pending"})
    session.commit()
    session.close()

    console.print(f"[cyan]Reset {reset_count} failed tiles to pending.[/cyan]")
    if reset_count > 0:
        resume()


@app.command()
def outreach(
    csv_path: str = typer.Option("results.csv", help="CSV file with collected contacts"),
    template: str = typer.Option("trial-invite", help="Template name: trial-invite or followup"),
    smtp_host: str = typer.Option("", help="SMTP host (e.g., smtp.gmail.com)"),
    smtp_port: int = typer.Option(587, help="SMTP port"),
    smtp_user: str = typer.Option("", help="SMTP username/email"),
    smtp_password: str = typer.Option("", help="SMTP password or app password"),
    from_name: str = typer.Option("", help="Sender display name"),
    from_email: str = typer.Option("", help="Sender email address"),
    company_name: str = typer.Option("", help="Your company name (required)"),
    physical_address: str = typer.Option("", help="Your physical mailing address (CAN-SPAM required)"),
    max_per_day: int = typer.Option(50, help="Maximum emails per day"),
    max_per_hour: int = typer.Option(20, help="Maximum emails per hour"),
    delay: float = typer.Option(5.0, help="Seconds between emails"),
    dry_run: bool = typer.Option(False, help="Preview emails without sending"),
    only_role_based: bool = typer.Option(True, help="Only send to role-based emails (info@, contact@, etc.)"),
):
    """Send CAN-SPAM compliant outreach to collected contacts."""
    import pandas as pd
    from service_contacts.outreach.sender import OutreachConfig, send_outreach
    from service_contacts.outreach.templates import (
        SERVICEPRO_TRIAL_INVITE_SUBJECT, SERVICEPRO_TRIAL_INVITE_BODY,
        SERVICEPRO_FOLLOWUP_SUBJECT, SERVICEPRO_FOLLOWUP_BODY,
    )

    setup_logging()

    if not dry_run and (not smtp_host or not from_email or not physical_address or not company_name):
        console.print("[red]ERROR: --smtp-host, --from-email, --company-name, and --physical-address are required for live sends.[/red]")
        console.print("[yellow]Use --dry-run to preview without sending.[/yellow]")
        return

    # Load contacts
    csv_file = Path(csv_path)
    if not csv_file.exists():
        console.print(f"[red]CSV not found: {csv_path}[/red]")
        return

    df = pd.read_csv(csv_file)
    console.print(f"Loaded {len(df)} contacts from {csv_path}")

    # Filter to contacts with email
    df = df[df["email"].notna() & (df["email"] != "")]
    if only_role_based:
        df = df[df["email_is_role_based"] == True]
    console.print(f"  {len(df)} with {'role-based ' if only_role_based else ''}email addresses")

    contacts = df.to_dict("records")

    # Select template
    if template == "followup":
        subject = SERVICEPRO_FOLLOWUP_SUBJECT
        body = SERVICEPRO_FOLLOWUP_BODY
    else:
        subject = SERVICEPRO_TRIAL_INVITE_SUBJECT
        body = SERVICEPRO_TRIAL_INVITE_BODY

    config = OutreachConfig(
        smtp_host=smtp_host or "smtp.example.com",
        smtp_port=smtp_port,
        smtp_user=smtp_user or from_email,
        smtp_password=smtp_password,
        from_name=from_name or company_name,
        from_email=from_email or "noreply@example.com",
        reply_to=from_email,
        physical_address=physical_address or "123 Main St, City, ST 12345",
        company_name=company_name or "Your Company",
        max_per_hour=max_per_hour,
        max_per_day=max_per_day,
        delay_between_emails=delay,
        send_log_path=str(DATA_DIR / "outreach_log.csv"),
        optout_path=str(DATA_DIR / "optout_list.csv"),
    )

    results = send_outreach(config, contacts, subject, body, dry_run=dry_run)

    sent = sum(1 for r in results if r.status == "sent")
    failed = sum(1 for r in results if r.status == "failed")
    skipped = sum(1 for r in results if "skipped" in r.status)
    dry = sum(1 for r in results if r.status == "dry_run")

    if dry_run:
        console.print(f"[yellow]DRY RUN: {dry} emails would be sent[/yellow]")
    else:
        console.print(f"[green]Sent: {sent}[/green] | Failed: {failed} | Skipped: {skipped}")
    console.print(f"Log: {config.send_log_path}")


if __name__ == "__main__":
    app()

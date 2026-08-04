"""CLI interface using Typer."""

from datetime import UTC, datetime
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
):
    """Collect business records from data sources."""
    setup_logging()
    engine = init_db()
    session = get_session(engine)

    state_list = parse_list(states) or ALL_STATES
    cat_list = parse_list(categories) or ALL_CATEGORY_NAMES

    console.print(f"[bold]Collecting from {len(state_list)} states, {len(cat_list)} categories, limit {limit}[/bold]")

    if dry_run:
        console.print("[yellow]DRY RUN — no network requests will be made[/yellow]")
        console.print(f"  States: {', '.join(state_list[:10])}{'...' if len(state_list) > 10 else ''}")
        console.print(f"  Categories: {', '.join(cat_list[:10])}{'...' if len(cat_list) > 10 else ''}")
        return 0, 0

    provider = OverpassProvider(timeout=timeout)
    count = 0

    with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), console=console) as progress:
        task = progress.add_task("Collecting...", total=None)
        for record in provider.collect(state_list, cat_list, limit):
            session.add(record)
            count += 1
            if count % 50 == 0:
                session.commit()
                progress.update(task, description=f"Collected {count} records...")

    session.commit()
    session.close()
    failed_path = export_failed_records(provider.failures, DATA_DIR / "failed_records.csv")
    console.print(f"[green]✓ Collected {count} records[/green]")
    if provider.failures:
        console.print(f"[yellow]⚠ Recorded {len(provider.failures)} failed queries in {failed_path}[/yellow]")
    return count, len(provider.failures)


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
):
    """Run full pipeline: collect → enrich → verify → export."""
    console.print("[bold]Running full pipeline[/bold]")
    started_at = datetime.now(UTC)
    summary: dict[str, Any] = {
        "status": "running",
        "started_at": started_at.isoformat(),
        "inputs": {"states": states, "categories": categories, "limit": limit, "workers": workers, "timeout": timeout},
        "output": output,
        "counts": {"collected": 0, "failed": 0, "enriched": 0, "verified": 0, "exported": 0},
    }
    try:
        collected, failed = collect(states=states, categories=categories, limit=limit, dry_run=dry_run, timeout=timeout)
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
    """Resume an interrupted collection/enrichment run."""
    setup_logging()
    console.print("[bold]Resuming interrupted run...[/bold]")
    enrich(workers=5, resume=True)
    verify()
    console.print("[green]✓ Resume complete[/green]")


if __name__ == "__main__":
    app()

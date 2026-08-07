"""CAN-SPAM compliant email outreach sender.

Requirements for CAN-SPAM compliance:
1. Accurate "From" and "Reply-To" headers
2. Subject line must not be deceptive
3. Message must identify itself as an advertisement (first contact)
4. Physical mailing address of the sender
5. Clear opt-out/unsubscribe mechanism
6. Honor opt-out within 10 business days
7. Monitor third-party compliance

This module enforces:
- Rate limiting (max emails per hour/day)
- Personalization from collected data
- Mandatory unsubscribe link
- Physical address in footer
- Sending log with delivery status
- Opt-out tracking
- Daily send limits
"""

import csv
import logging
import smtplib
import time
from dataclasses import dataclass, field
from datetime import UTC, datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from string import Template

logger = logging.getLogger("service_contacts.outreach")


@dataclass
class OutreachConfig:
    """SMTP and compliance configuration."""
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True

    from_name: str = ""
    from_email: str = ""
    reply_to: str = ""

    # CAN-SPAM required
    physical_address: str = ""  # Your business mailing address
    company_name: str = ""

    # Rate limits
    max_per_hour: int = 30
    max_per_day: int = 200
    delay_between_emails: float = 5.0  # seconds

    # Tracking
    send_log_path: str = "data/outreach_log.csv"
    optout_path: str = "data/optout_list.csv"


@dataclass
class OutreachResult:
    email: str
    company: str
    status: str  # sent, failed, skipped_optout, skipped_rate_limit
    timestamp: str = ""
    error: str = ""


def load_optouts(path: str) -> set[str]:
    """Load opt-out list (emails that have unsubscribed)."""
    optout_file = Path(path)
    if not optout_file.exists():
        return set()
    optouts = set()
    with optout_file.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            email = row.get("email", "").strip().lower()
            if email:
                optouts.add(email)
    return optouts


def add_optout(path: str, email: str):
    """Add an email to the opt-out list."""
    optout_file = Path(path)
    optout_file.parent.mkdir(parents=True, exist_ok=True)
    exists = optout_file.exists()
    with optout_file.open("a", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        if not exists:
            writer.writerow(["email", "opted_out_at"])
        writer.writerow([email.lower(), datetime.now(UTC).isoformat()])


def load_send_log(path: str) -> list[dict]:
    """Load previous send log to enforce daily limits."""
    log_file = Path(path)
    if not log_file.exists():
        return []
    with log_file.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def count_sent_today(log: list[dict]) -> int:
    """Count emails sent today."""
    today = datetime.now(UTC).date().isoformat()
    return sum(1 for row in log if row.get("timestamp", "").startswith(today) and row.get("status") == "sent")


def build_email(
    config: OutreachConfig,
    to_email: str,
    to_company: str,
    subject_template: str,
    body_template: str,
    variables: dict,
) -> MIMEMultipart:
    """Build a CAN-SPAM compliant email message."""
    # Merge variables
    all_vars = {
        "company_name": to_company,
        "to_email": to_email,
        "sender_name": config.from_name,
        "sender_company": config.company_name,
        "physical_address": config.physical_address,
        **variables,
    }

    subject = Template(subject_template).safe_substitute(all_vars)
    body_html = Template(body_template).safe_substitute(all_vars)

    # Add required CAN-SPAM footer
    footer = f"""
    <hr style="margin-top:30px;border:none;border-top:1px solid #ddd;">
    <p style="font-size:11px;color:#888;line-height:1.5;">
        This is a one-time business introduction from {config.company_name}.<br>
        {config.physical_address}<br><br>
        <a href="mailto:{config.reply_to}?subject=Unsubscribe&body=Please remove {to_email} from future emails">
            Unsubscribe / Opt-out
        </a> — We will honor your request within 48 hours.
    </p>
    """

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{config.from_name} <{config.from_email}>"
    msg["To"] = to_email
    msg["Reply-To"] = config.reply_to or config.from_email
    msg["Subject"] = subject
    msg["X-Campaign"] = "servicepro-b2b-outreach"

    # Plain text version
    plain_text = f"{subject}\n\n{body_html.replace('<br>', chr(10)).replace('</p>', chr(10))}"
    # Strip HTML tags for plain text
    import re
    plain_text = re.sub(r"<[^>]+>", "", plain_text)

    full_html = f"""
    <html><body style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#333;">
    {body_html}
    {footer}
    </body></html>
    """

    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(full_html, "html"))
    return msg


def send_outreach(
    config: OutreachConfig,
    contacts: list[dict],
    subject_template: str,
    body_template: str,
    extra_variables: dict | None = None,
    dry_run: bool = False,
) -> list[OutreachResult]:
    """
    Send personalized outreach to a list of contacts.

    Args:
        config: SMTP and compliance settings
        contacts: List of dicts with at least 'email' and 'company_name'
        subject_template: Subject with $variable placeholders
        body_template: HTML body with $variable placeholders
        extra_variables: Additional template variables
        dry_run: If True, build emails but don't send

    Returns:
        List of OutreachResult for each contact
    """
    if not config.physical_address:
        raise ValueError("physical_address is required for CAN-SPAM compliance")
    if not config.from_email:
        raise ValueError("from_email is required")
    if not config.company_name:
        raise ValueError("company_name is required")

    results: list[OutreachResult] = []
    optouts = load_optouts(config.optout_path)
    send_log = load_send_log(config.send_log_path)
    sent_today = count_sent_today(send_log)
    sent_this_hour = 0

    logger.info(f"Starting outreach to {len(contacts)} contacts (sent today: {sent_today})")

    for contact in contacts:
        email = (contact.get("email") or "").strip().lower()
        company = contact.get("company_name", "")

        if not email:
            results.append(OutreachResult(email="", company=company, status="skipped_no_email"))
            continue

        if email in optouts:
            results.append(OutreachResult(email=email, company=company, status="skipped_optout"))
            logger.debug(f"Skipping opted-out: {email}")
            continue

        if sent_today >= config.max_per_day:
            results.append(OutreachResult(email=email, company=company, status="skipped_rate_limit"))
            logger.warning(f"Daily limit reached ({config.max_per_day})")
            break

        if sent_this_hour >= config.max_per_hour:
            results.append(OutreachResult(email=email, company=company, status="skipped_rate_limit"))
            continue

        variables = {**(extra_variables or {}), **contact}
        msg = build_email(config, email, company, subject_template, body_template, variables)

        if dry_run:
            results.append(OutreachResult(
                email=email, company=company, status="dry_run",
                timestamp=datetime.now(UTC).isoformat()
            ))
            logger.info(f"[DRY RUN] Would send to: {email} ({company})")
            continue

        # Send
        try:
            _send_smtp(config, msg)
            result = OutreachResult(
                email=email, company=company, status="sent",
                timestamp=datetime.now(UTC).isoformat()
            )
            sent_today += 1
            sent_this_hour += 1
            logger.info(f"Sent to: {email} ({company})")
        except Exception as e:
            result = OutreachResult(
                email=email, company=company, status="failed",
                timestamp=datetime.now(UTC).isoformat(), error=str(e)[:200]
            )
            logger.error(f"Failed to send to {email}: {e}")

        results.append(result)

        # Rate limit delay
        time.sleep(config.delay_between_emails)

    # Save send log
    _append_send_log(config.send_log_path, results)
    logger.info(f"Outreach complete: {sum(1 for r in results if r.status == 'sent')} sent, "
                f"{sum(1 for r in results if r.status == 'failed')} failed, "
                f"{sum(1 for r in results if 'skipped' in r.status)} skipped")
    return results


def _send_smtp(config: OutreachConfig, msg: MIMEMultipart):
    """Send a single email via SMTP."""
    with smtplib.SMTP(config.smtp_host, config.smtp_port) as server:
        if config.smtp_use_tls:
            server.starttls()
        if config.smtp_user and config.smtp_password:
            server.login(config.smtp_user, config.smtp_password)
        server.send_message(msg)


def _append_send_log(path: str, results: list[OutreachResult]):
    """Append results to the send log CSV."""
    log_file = Path(path)
    log_file.parent.mkdir(parents=True, exist_ok=True)
    exists = log_file.exists()
    with log_file.open("a", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        if not exists:
            writer.writerow(["email", "company", "status", "timestamp", "error"])
        for r in results:
            writer.writerow([r.email, r.company, r.status, r.timestamp, r.error])

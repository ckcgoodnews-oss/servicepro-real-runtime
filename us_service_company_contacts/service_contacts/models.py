"""SQLAlchemy models for staging database."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text, Boolean, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from service_contacts.config import DATABASE_URL


class Base(DeclarativeBase):
    pass


class SourceRecord(Base):
    __tablename__ = "source_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_name = Column(String(100), nullable=False)
    source_url = Column(Text, default="")
    source_record_id = Column(String(255), default="")
    company_name = Column(String(500), nullable=False)
    service_category = Column(String(100), default="")
    service_subcategory = Column(String(100), default="")
    website = Column(Text, default="")
    email = Column(String(255), default="")
    phone = Column(String(50), default="")
    street_address = Column(Text, default="")
    city = Column(String(100), default="")
    state = Column(String(10), default="")
    postal_code = Column(String(20), default="")
    country = Column(String(10), default="US")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    raw_data = Column(Text, default="")
    date_collected = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String(500), nullable=False)
    service_category = Column(String(200), default="")
    service_subcategory = Column(String(200), default="")
    website = Column(Text, default="")
    website_final_url = Column(Text, default="")
    website_status = Column(String(50), default="")
    website_http_status = Column(Integer, nullable=True)
    domain = Column(String(255), default="")
    domain_has_dns = Column(Boolean, nullable=True)
    domain_has_mx = Column(Boolean, nullable=True)
    email = Column(String(255), default="")
    email_source_url = Column(Text, default="")
    email_is_public = Column(Boolean, nullable=True)
    email_is_role_based = Column(Boolean, nullable=True)
    email_syntax_valid = Column(Boolean, nullable=True)
    email_domain_matches_website = Column(Boolean, nullable=True)
    email_domain_has_mx = Column(Boolean, nullable=True)
    email_verification_status = Column(String(100), default="")
    phone = Column(String(50), default="")
    phone_e164 = Column(String(20), default="")
    phone_valid = Column(Boolean, nullable=True)
    phone_source = Column(String(100), default="")
    street_address = Column(Text, default="")
    city = Column(String(100), default="")
    state = Column(String(10), default="")
    postal_code = Column(String(20), default="")
    country = Column(String(10), default="US")
    source_name = Column(String(100), default="")
    source_url = Column(Text, default="")
    source_record_id = Column(String(255), default="")
    date_collected = Column(DateTime, default=datetime.utcnow)
    date_verified = Column(DateTime, nullable=True)
    robots_allowed = Column(Boolean, nullable=True)
    confidence_score = Column(Integer, default=0)
    notes = Column(Text, default="")
    merged_from = Column(Text, default="")


class CrawlQueue(Base):
    __tablename__ = "crawl_queue"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, nullable=False)
    url = Column(Text, nullable=False)
    status = Column(String(50), default="pending")
    attempts = Column(Integer, default=0)
    last_attempt_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error = Column(Text, default="")


class CrawlLog(Base):
    __tablename__ = "crawl_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(Text, nullable=False)
    status_code = Column(Integer, nullable=True)
    robots_allowed = Column(Boolean, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    duration_ms = Column(Integer, default=0)
    result = Column(String(50), default="")
    error = Column(Text, default="")


class VerificationEvent(Base):
    __tablename__ = "verification_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, nullable=False)
    check_type = Column(String(50), nullable=False)
    result = Column(String(100), default="")
    details = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.utcnow)


class ExportRun(Base):
    __tablename__ = "export_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(Text, nullable=False)
    record_count = Column(Integer, default=0)
    filters = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.utcnow)


def get_engine(url: str | None = None):
    db_url = url or DATABASE_URL
    return create_engine(db_url, echo=False)


def init_db(engine=None):
    if engine is None:
        engine = get_engine()
    Base.metadata.create_all(engine)
    return engine


def get_session(engine=None) -> Session:
    if engine is None:
        engine = get_engine()
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()

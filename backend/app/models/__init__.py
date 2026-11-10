import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Target(Base):
    __tablename__ = "targets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(1024), nullable=False, unique=True, index=True)
    host = Column(String(255), nullable=False, index=True)
    ip_address = Column(String(128), nullable=True)
    is_authorized = Column(Boolean, default=False, nullable=False)
    authorization_notes = Column(Text, nullable=True)
    is_allowlisted = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    scans = relationship("Scan", back_populates="target", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="target", cascade="all, delete-orphan")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False, index=True)
    scan_type = Column(String(64), default="FULL", nullable=False)  # FULL, RECON, PORTS, SSL, HEADERS, DAST, CVE
    status = Column(String(32), default="PENDING", nullable=False)   # PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
    progress = Column(Integer, default=0, nullable=False)
    current_stage = Column(String(128), default="Initialized", nullable=False)
    security_score = Column(Integer, default=100, nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    summary_json = Column(Text, default="{}")  # JSON string of stats

    target = relationship("Target", back_populates="scans")
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")
    logs = relationship("ScanLog", back_populates="scan", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False, index=True)
    title = Column(String(512), nullable=False)
    category = Column(String(64), nullable=False)  # RECON, PORT, SSL_TLS, HEADERS, SQLI, XSS, CVE, MISCONFIG
    severity = Column(String(32), nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence = Column(String(32), default="HIGH", nullable=False)  # CONFIRMED, HIGH, MEDIUM, LOW
    cve_id = Column(String(64), nullable=True)
    cvss_score = Column(Float, nullable=True)
    description = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    references_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scan = relationship("Scan", back_populates="findings")
    target = relationship("Target", back_populates="findings")

class ScanLog(Base):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    level = Column(String(16), default="INFO")  # INFO, WARNING, ERROR, SUCCESS
    message = Column(Text, nullable=False)

    scan = relationship("Scan", back_populates="logs")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    action = Column(String(128), nullable=False)
    target_url = Column(String(1024), nullable=True)
    details = Column(Text, nullable=True)
    ip_origin = Column(String(64), default="127.0.0.1")


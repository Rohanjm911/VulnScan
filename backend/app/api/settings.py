from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.config import settings
from app.database import get_db
from app.models import AuditLog

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingsUpdate(BaseModel):
    safe_mode: bool = True
    ssrf_protection: bool = True
    allow_local_targets: bool = True
    default_timeout_sec: float = 8.0
    max_concurrent_ports: int = 50

@router.get("")
def get_system_settings():
    return {
        "app_name": settings.APP_NAME,
        "app_version": settings.APP_VERSION,
        "safe_mode": settings.SAFE_MODE,
        "ssrf_protection": settings.SSRF_PROTECTION,
        "allow_local_targets": settings.ALLOW_LOCAL_TARGETS,
        "default_timeout_sec": settings.DEFAULT_TIMEOUT_SEC,
        "max_concurrent_ports": settings.MAX_CONCURRENT_PORTS,
        "report_dir": settings.REPORT_DIR,
    }

@router.post("")
def update_system_settings(cfg: SettingsUpdate):
    settings.SAFE_MODE = cfg.safe_mode
    settings.SSRF_PROTECTION = cfg.ssrf_protection
    settings.ALLOW_LOCAL_TARGETS = cfg.allow_local_targets
    settings.DEFAULT_TIMEOUT_SEC = cfg.default_timeout_sec
    settings.MAX_CONCURRENT_PORTS = cfg.max_concurrent_ports
    return {"message": "Settings updated successfully", "current": get_system_settings()}

@router.get("/audit-logs")
def list_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return logs

@router.post("/reset-demo")
def reset_demo_data(db: Session = Depends(get_db)):
    from app.models import Target, Scan, Finding, ScanLog
    from app.main import seed_demo_data
    db.query(Finding).delete()
    db.query(ScanLog).delete()
    db.query(Scan).delete()
    db.query(Target).delete()
    db.commit()
    seed_demo_data()
    return {"message": "Database reset and demonstration test lab reseeded successfully."}



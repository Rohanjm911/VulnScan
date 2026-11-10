import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import Scan, Target, Finding
from app.services.report_service import generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("")
def list_reports():
    reports = []
    if os.path.exists(settings.REPORT_DIR):
        for f in os.listdir(settings.REPORT_DIR):
            if f.endswith(".pdf"):
                full_path = os.path.join(settings.REPORT_DIR, f)
                stat = os.stat(full_path)
                reports.append({
                    "filename": f,
                    "size_bytes": stat.st_size,
                    "created_at": stat.st_mtime
                })
    return sorted(reports, key=lambda x: x["created_at"], reverse=True)

@router.get("/generate/{scan_id}")
def generate_report_for_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    target = db.query(Target).filter(Target.id == scan.target_id).first()
    findings = db.query(Finding).filter(Finding.scan_id == scan.id).all()

    findings_dicts = [
        {
            "title": f.title,
            "category": f.category,
            "severity": f.severity,
            "description": f.description,
            "evidence": f.evidence,
            "remediation": f.remediation
        }
        for f in findings
    ]

    target_data = {"host": target.host if target else "Unknown", "url": target.url if target else "Unknown"}
    scan_data = {
        "id": scan.id,
        "started_at": str(scan.started_at),
        "security_score": scan.security_score,
        "scan_type": scan.scan_type,
        "status": scan.status
    }

    pdf_path = generate_pdf_report(scan_data, target_data, findings_dicts)
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(pdf_path)
    )

@router.get("/download/{filename}")
def download_report_by_name(filename: str):
    safe_name = os.path.basename(filename)
    path = os.path.join(settings.REPORT_DIR, safe_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Report file not found")
    return FileResponse(path, media_type="application/pdf", filename=safe_name)


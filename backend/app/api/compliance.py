from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Finding
from app.services.compliance_service import ComplianceAuditService

router = APIRouter(prefix="/compliance", tags=["Compliance & Benchmark Matrix"])

@router.get("/matrix")
def get_compliance_matrix(target_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Finding)
    if target_id is not None:
        query = query.filter(Finding.target_id == target_id)
    
    db_findings = query.all()
    findings_dicts = [
        {
            "id": f.id,
            "title": f.title,
            "category": f.category,
            "severity": f.severity
        }
        for f in db_findings
    ]

    return ComplianceAuditService.evaluate_findings(findings_dicts)

@router.post("/audit")
def run_compliance_audit(target_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Finding)
    if target_id is not None:
        query = query.filter(Finding.target_id == target_id)
        
    db_findings = query.all()
    findings_dicts = [
        {
            "id": f.id,
            "title": f.title,
            "category": f.category,
            "severity": f.severity
        }
        for f in db_findings
    ]

    return ComplianceAuditService.evaluate_findings(findings_dicts)


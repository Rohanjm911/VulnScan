from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Finding
from app.schemas.finding import FindingOut

router = APIRouter(prefix="/findings", tags=["Findings"])

@router.get("", response_model=List[FindingOut])
def list_findings(
    severity: Optional[str] = Query(None, description="Filter by CRITICAL, HIGH, MEDIUM, LOW, INFO"),
    category: Optional[str] = Query(None, description="Filter by category"),
    target_id: Optional[int] = Query(None, description="Filter by target ID"),
    scan_id: Optional[int] = Query(None, description="Filter by scan ID"),
    search: Optional[str] = Query(None, description="Search term in title or description"),
    db: Session = Depends(get_db)
):
    query = db.query(Finding)
    if severity:
        query = query.filter(Finding.severity == severity.upper())
    if category:
        query = query.filter(Finding.category == category.upper())
    if target_id:
        query = query.filter(Finding.target_id == target_id)
    if scan_id:
        query = query.filter(Finding.scan_id == scan_id)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(Finding.title.ilike(search_fmt) | Finding.description.ilike(search_fmt))

    return query.order_by(Finding.created_at.desc()).all()

@router.get("/{finding_id}", response_model=FindingOut)
def get_finding(finding_id: int, db: Session = Depends(get_db)):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    return finding


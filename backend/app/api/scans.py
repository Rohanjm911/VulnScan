import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import datetime
from app.database import get_db
from app.models import Scan, Target, AuditLog
from app.schemas.scan import ScanCreate, ScanOut, ScanDetailOut
from app.services.scan_orchestrator import run_scan_pipeline

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.get("", response_model=List[ScanOut])
def list_scans(db: Session = Depends(get_db)):
    return db.query(Scan).order_by(Scan.started_at.desc()).all()

@router.post("", response_model=ScanOut, status_code=201)
def start_scan(scan_in: ScanCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    target = db.query(Target).filter(Target.id == scan_in.target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")

    if not target.is_authorized:
        raise HTTPException(
            status_code=403,
            detail="Security Enforcement: Cannot initiate scan. Target authorization has not been explicitly confirmed."
        )

    # Check if a scan is already running on this target
    active_scan = db.query(Scan).filter(
        Scan.target_id == target.id,
        Scan.status.in_(["PENDING", "RUNNING"])
    ).first()
    if active_scan:
        raise HTTPException(status_code=409, detail=f"A scan is currently already running on this target (Scan #{active_scan.id}).")

    new_scan = Scan(
        target_id=target.id,
        scan_type=scan_in.scan_type.upper(),
        status="PENDING",
        progress=0,
        current_stage="Queued",
        security_score=100,
        started_at=datetime.datetime.utcnow()
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    audit = AuditLog(
        action="SCAN_INITIATED",
        target_url=target.url,
        details=f"Initiated {scan_in.scan_type} scan #{new_scan.id}"
    )
    db.add(audit)
    db.commit()

    # Trigger scan pipeline asynchronously in background
    background_tasks.add_task(run_scan_pipeline, new_scan.id)

    return new_scan

@router.get("/{scan_id}", response_model=ScanDetailOut)
def get_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

@router.post("/{scan_id}/cancel")
def cancel_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    if scan.status in ("COMPLETED", "FAILED", "CANCELLED"):
        return {"message": f"Scan is already in final state: {scan.status}"}

    scan.status = "CANCELLED"
    scan.current_stage = "Cancelled by user"
    db.commit()
    return {"message": "Scan cancelled successfully"}


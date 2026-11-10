from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import datetime
from app.database import get_db
from app.models import Target, AuditLog
from app.schemas.target import TargetCreate, TargetUpdate, TargetOut
from app.services.target_service import normalize_target_url, validate_ssrf

router = APIRouter(prefix="/targets", tags=["Targets"])

@router.get("", response_model=List[TargetOut])
def list_targets(db: Session = Depends(get_db)):
    return db.query(Target).order_by(Target.created_at.desc()).all()

@router.post("", response_model=TargetOut, status_code=201)
def create_target(target_in: TargetCreate, db: Session = Depends(get_db)):
    if not target_in.is_authorized:
        raise HTTPException(
            status_code=400,
            detail="Authorization Policy: You must confirm explicit ownership or legal penetration testing authorization before adding a target."
        )

    canonical_url, host, ip = normalize_target_url(target_in.url)
    validate_ssrf(ip)

    existing = db.query(Target).filter(Target.url == canonical_url).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Target '{canonical_url}' is already registered in the system.")

    new_target = Target(
        name=target_in.name,
        url=canonical_url,
        host=host,
        ip_address=ip,
        is_authorized=target_in.is_authorized,
        authorization_notes=target_in.authorization_notes,
        is_allowlisted=True,
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(new_target)

    # Audit log
    audit = AuditLog(
        action="TARGET_CREATED",
        target_url=canonical_url,
        details=f"Target created with authorization confirmation: {target_in.authorization_notes or 'Self-certified'}"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_target)
    return new_target

@router.get("/{target_id}", response_model=TargetOut)
def get_target(target_id: int, db: Session = Depends(get_db)):
    target = db.query(Target).filter(Target.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    return target

@router.put("/{target_id}", response_model=TargetOut)
def update_target(target_id: int, update_data: TargetUpdate, db: Session = Depends(get_db)):
    target = db.query(Target).filter(Target.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")

    if update_data.name is not None:
        target.name = update_data.name
    if update_data.is_authorized is not None:
        target.is_authorized = update_data.is_authorized
    if update_data.authorization_notes is not None:
        target.authorization_notes = update_data.authorization_notes
    if update_data.is_allowlisted is not None:
        target.is_allowlisted = update_data.is_allowlisted

    target.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(target)
    return target

@router.delete("/{target_id}", status_code=204)
def delete_target(target_id: int, db: Session = Depends(get_db)):
    target = db.query(Target).filter(Target.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    db.delete(target)
    db.commit()
    return None


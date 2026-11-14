from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import datetime
from app.database import get_db
from app.models import Schedule, Target
from app.services.webhook_service import WebhookService

router = APIRouter(prefix="/schedules", tags=["Scan Schedules & Webhooks"])

class ScheduleCreateRequest(BaseModel):
    target_id: int
    scan_type: str = "FULL"
    frequency: str = "DAILY"  # HOURLY, DAILY, WEEKLY
    webhook_url: Optional[str] = None
    webhook_platform: Optional[str] = "DISCORD"  # DISCORD, SLACK, CUSTOM
    is_active: bool = True

class TestWebhookRequest(BaseModel):
    webhook_url: str
    webhook_platform: str = "DISCORD"

@router.get("")
def list_schedules(db: Session = Depends(get_db)):
    schedules = db.query(Schedule).all()
    results = []
    for s in schedules:
        target_name = s.target.name if s.target else "Unknown Target"
        target_url = s.target.target_url if s.target else ""
        results.append({
            "id": s.id,
            "target_id": s.target_id,
            "target_name": target_name,
            "target_url": target_url,
            "scan_type": s.scan_type,
            "frequency": s.frequency,
            "webhook_url": s.webhook_url,
            "webhook_platform": s.webhook_platform,
            "is_active": s.is_active,
            "last_run_at": s.last_run_at.isoformat() if s.last_run_at else None,
            "next_run_at": s.next_run_at.isoformat() if s.next_run_at else None,
            "created_at": s.created_at.isoformat() if s.created_at else None
        })
    return results

@router.post("")
def create_schedule(req: ScheduleCreateRequest, db: Session = Depends(get_db)):
    target = db.query(Target).filter(Target.id == req.target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")

    now = datetime.datetime.utcnow()
    next_run = now + datetime.timedelta(days=1)
    if req.frequency.upper() == "HOURLY":
        next_run = now + datetime.timedelta(hours=1)
    elif req.frequency.upper() == "WEEKLY":
        next_run = now + datetime.timedelta(weeks=1)

    schedule = Schedule(
        target_id=req.target_id,
        scan_type=req.scan_type,
        frequency=req.frequency.upper(),
        webhook_url=req.webhook_url,
        webhook_platform=req.webhook_platform.upper() if req.webhook_platform else "DISCORD",
        is_active=req.is_active,
        last_run_at=None,
        next_run_at=next_run,
        created_at=now
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    return {
        "id": schedule.id,
        "target_id": schedule.target_id,
        "target_name": target.name,
        "scan_type": schedule.scan_type,
        "frequency": schedule.frequency,
        "webhook_url": schedule.webhook_url,
        "webhook_platform": schedule.webhook_platform,
        "is_active": schedule.is_active,
        "next_run_at": schedule.next_run_at.isoformat() if schedule.next_run_at else None
    }

@router.post("/{schedule_id}/toggle")
def toggle_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    schedule.is_active = not schedule.is_active
    db.commit()
    return {"id": schedule.id, "is_active": schedule.is_active}

@router.delete("/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    db.delete(schedule)
    db.commit()
    return {"success": True, "message": "Schedule deleted successfully"}

@router.post("/test-webhook")
async def test_webhook_dispatch(req: TestWebhookRequest):
    if not req.webhook_url or not req.webhook_url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid webhook URL")

    result = await WebhookService.send_test_ping(req.webhook_url, req.webhook_platform)
    return result


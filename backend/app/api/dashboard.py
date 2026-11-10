from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Target, Scan, Finding

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_targets = db.query(Target).count()
    completed_scans = db.query(Scan).filter(Scan.status == "COMPLETED").count()
    running_scans = db.query(Scan).filter(Scan.status == "RUNNING").count()

    # Severity counts
    critical_count = db.query(Finding).filter(Finding.severity == "CRITICAL").count()
    high_count = db.query(Finding).filter(Finding.severity == "HIGH").count()
    medium_count = db.query(Finding).filter(Finding.severity == "MEDIUM").count()
    low_count = db.query(Finding).filter(Finding.severity == "LOW").count()
    info_count = db.query(Finding).filter(Finding.severity == "INFO").count()

    # Average security score across completed scans
    avg_score_query = db.query(func.avg(Scan.security_score)).filter(Scan.status == "COMPLETED").scalar()
    overall_score = int(avg_score_query) if avg_score_query is not None else 100

    # Severity distribution for charts
    severity_distribution = [
        {"name": "Critical", "count": critical_count, "fill": "#EF4444"},
        {"name": "High", "count": high_count, "fill": "#F97316"},
        {"name": "Medium", "count": medium_count, "fill": "#FBBF24"},
        {"name": "Low", "count": low_count, "fill": "#3B82F6"},
        {"name": "Info", "count": info_count, "fill": "#10B981"}
    ]

    # Category distribution
    categories = ["RECON", "PORT", "SSL_TLS", "HEADERS", "SQLI", "XSS", "CVE", "MISCONFIG"]
    category_distribution = []
    for cat in categories:
        count = db.query(Finding).filter(Finding.category == cat).count()
        if count > 0 or True:
            category_distribution.append({"category": cat, "count": count})

    # Recent scans
    recent_scans = db.query(Scan).order_by(Scan.started_at.desc()).limit(6).all()
    recent_scans_data = []
    for s in recent_scans:
        target = db.query(Target).filter(Target.id == s.target_id).first()
        recent_scans_data.append({
            "id": s.id,
            "target_id": s.target_id,
            "target_name": target.name if target else "Unknown",
            "target_url": target.url if target else "",
            "scan_type": s.scan_type,
            "status": s.status,
            "progress": s.progress,
            "current_stage": s.current_stage,
            "security_score": s.security_score,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None
        })

    return {
        "overall_score": overall_score,
        "total_targets": total_targets,
        "completed_scans": completed_scans,
        "running_scans": running_scans,
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "info_count": info_count,
        "total_findings": critical_count + high_count + medium_count + low_count + info_count,
        "severity_distribution": severity_distribution,
        "category_distribution": category_distribution,
        "recent_scans": recent_scans_data
    }


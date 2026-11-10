from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List
from app.services.cve_service import CVE_KNOWLEDGE_BASE, correlate_cves

router = APIRouter(prefix="/cve", tags=["CVE Intelligence"])

class BannerCheckRequest(BaseModel):
    banner: Optional[str] = None
    technologies: Optional[List[str]] = []

@router.get("/database")
def get_cve_database(search: Optional[str] = Query(None)):
    if not search:
        return {"total": len(CVE_KNOWLEDGE_BASE), "items": CVE_KNOWLEDGE_BASE}
    
    term = search.lower()
    filtered = [
        item for item in CVE_KNOWLEDGE_BASE
        if term in item["cve_id"].lower() 
        or term in item["software"].lower() 
        or term in item["title"].lower() 
        or term in item["description"].lower()
    ]
    return {"total": len(filtered), "items": filtered}

@router.post("/check-banner")
def check_banner_cves(req: BannerCheckRequest):
    matches = correlate_cves(req.banner, req.technologies or [])
    return {
        "banner": req.banner,
        "matched_count": len(matches),
        "matches": matches
    }

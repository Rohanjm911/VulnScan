from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from urllib.parse import urlparse
from app.services.cloud_recon_service import CloudReconService
from app.services.recon_service import discover_subdomains

router = APIRouter(prefix="/cloud-recon", tags=["Cloud Recon & Subdomain Takeover"])

class CloudReconRequest(BaseModel):
    domain: str
    check_takeover: bool = True
    check_buckets: bool = True

@router.post("/scan")
async def scan_cloud_infrastructure(req: CloudReconRequest):
    raw = req.domain.strip().lower()
    if "://" in raw:
        parsed = urlparse(raw)
        domain = parsed.hostname or raw
    else:
        domain = raw.split("/")[0]

    if not domain or len(domain) < 3:
        raise HTTPException(status_code=400, detail="Invalid domain provided")

    takeover_results = []
    bucket_results = []

    if req.check_takeover:
        # Discover subdomains first
        discovered = discover_subdomains(domain)
        subdomains = [s.get("subdomain", "") for s in discovered if s.get("subdomain")]
        takeover_results = await CloudReconService.check_subdomain_takeover(domain, subdomains)

    if req.check_buckets:
        bucket_results = await CloudReconService.scan_cloud_buckets(domain)

    # Compute risk summary
    critical_count = sum(1 for r in takeover_results if r.get("severity") == "CRITICAL") + \
                     sum(1 for b in bucket_results if b.get("severity") == "CRITICAL")
    high_count = sum(1 for r in takeover_results if r.get("severity") == "HIGH")

    return {
        "domain": domain,
        "critical_issues": critical_count,
        "high_issues": high_count,
        "subdomain_takeovers": takeover_results,
        "cloud_buckets": bucket_results,
        "total_assets_scanned": len(takeover_results) + len(bucket_results)
    }


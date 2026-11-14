import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.recon_service import analyze_dns_records, discover_subdomains, fingerprint_technology
from app.services.target_service import normalize_target_url, validate_ssrf

router = APIRouter(prefix="/recon", tags=["Reconnaissance"])

class ReconRequest(BaseModel):
    url: str

@router.post("/inspect")
async def inspect_target_recon(req: ReconRequest):
    try:
        canonical_url, host, ip = normalize_target_url(req.url)
        validate_ssrf(ip)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid target URL or resolution failure: {str(e)}")

    dns_task = asyncio.to_thread(analyze_dns_records, host)
    subdomains_task = asyncio.to_thread(discover_subdomains, host)
    tech_task = fingerprint_technology(canonical_url)

    dns_records, subdomains, tech = await asyncio.gather(
        dns_task, subdomains_task, tech_task, return_exceptions=True
    )

    return {
        "canonical_url": canonical_url,
        "host": host,
        "ip": ip,
        "dns_records": dns_records if isinstance(dns_records, dict) else {},
        "subdomains": subdomains if isinstance(subdomains, list) else [],
        "technology_fingerprint": tech if isinstance(tech, dict) else {"server": "Unknown", "technologies": []}
    }


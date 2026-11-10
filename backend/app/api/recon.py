from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.recon_service import analyze_dns_records, discover_subdomains, fingerprint_technology
from app.services.target_service import normalize_target_url, validate_ssrf

router = APIRouter(prefix="/recon", tags=["Reconnaissance"])

class ReconRequest(BaseModel):
    url: str

@router.post("/inspect")
async def inspect_target_recon(req: ReconRequest):
    canonical_url, host, ip = normalize_target_url(req.url)
    validate_ssrf(ip)

    dns_records = analyze_dns_records(host)
    subdomains = discover_subdomains(host)
    tech = await fingerprint_technology(canonical_url)

    return {
        "canonical_url": canonical_url,
        "host": host,
        "ip": ip,
        "dns_records": dns_records,
        "subdomains": subdomains,
        "technology_fingerprint": tech
    }


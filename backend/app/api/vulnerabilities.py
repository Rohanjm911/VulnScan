from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.sqli_service import check_sqli
from app.services.xss_service import check_reflected_xss
from app.services.target_service import normalize_target_url, validate_ssrf

router = APIRouter(prefix="/vulnerabilities", tags=["Vulnerability Assessment"])

class DastProbeRequest(BaseModel):
    url: str

@router.post("/test-sqli")
async def test_sqli_live(req: DastProbeRequest) -> Dict[str, Any]:
    canonical_url, host, ip = normalize_target_url(req.url)
    validate_ssrf(ip)

    findings = await check_sqli(canonical_url)
    return {
        "target_url": canonical_url,
        "type": "SQL_INJECTION_PROBE",
        "total_findings": len(findings),
        "findings": findings
    }

@router.post("/test-xss")
async def test_xss_live(req: DastProbeRequest) -> Dict[str, Any]:
    canonical_url, host, ip = normalize_target_url(req.url)
    validate_ssrf(ip)

    findings = await check_reflected_xss(canonical_url)
    return {
        "target_url": canonical_url,
        "type": "REFLECTED_XSS_PROBE",
        "total_findings": len(findings),
        "findings": findings
    }


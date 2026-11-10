from fastapi import APIRouter
from pydantic import BaseModel
from app.services.header_service import analyze_headers
from app.services.target_service import normalize_target_url, validate_ssrf

router = APIRouter(prefix="/headers", tags=["Header Analyzer"])

class HeaderAuditRequest(BaseModel):
    url: str

@router.post("/analyze")
async def audit_target_headers(req: HeaderAuditRequest):
    canonical_url, _, ip = normalize_target_url(req.url)
    validate_ssrf(ip)

    res = await analyze_headers(canonical_url)
    return res


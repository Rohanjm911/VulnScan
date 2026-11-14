from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.target_service import normalize_target_url, validate_ssrf
from app.services.secret_scanner_service import SecretScannerService

router = APIRouter(prefix="/secrets", tags=["Secret & API Key Scanner"])

class SecretScanRequest(BaseModel):
    target_url: str

@router.post("/scan")
async def scan_for_secrets(req: SecretScanRequest):
    if not req.target_url or not req.target_url.strip():
        raise HTTPException(status_code=400, detail="Target URL cannot be empty")

    canonical_url, host, ip = normalize_target_url(req.target_url)
    validate_ssrf(ip)

    result = await SecretScannerService.scan_target_for_secrets(canonical_url)
    return result


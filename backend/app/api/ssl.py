from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ssl_service import analyze_ssl_tls
from app.services.target_service import normalize_target_url, validate_ssrf

router = APIRouter(prefix="/ssl", tags=["SSL Analyzer"])

class SslRequest(BaseModel):
    url: str

@router.post("/analyze")
def analyze_target_ssl(req: SslRequest):
    _, host, ip = normalize_target_url(req.url)
    validate_ssrf(ip)

    res = analyze_ssl_tls(host)
    return {
        "host": host,
        "analysis": res
    }


from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.port_scanner import scan_ports
from app.services.target_service import normalize_target_url, validate_ssrf

router = APIRouter(prefix="/ports", tags=["Port Scanner"])

class PortScanRequest(BaseModel):
    url: str
    custom_ports: Optional[List[int]] = None

@router.post("/scan")
async def scan_target_ports(req: PortScanRequest):
    _, host, ip = normalize_target_url(req.url)
    validate_ssrf(ip)

    open_ports = await scan_ports(host, ports=req.custom_ports)
    return {
        "host": host,
        "ip": ip,
        "total_open": len(open_ports),
        "open_ports": open_ports
    }


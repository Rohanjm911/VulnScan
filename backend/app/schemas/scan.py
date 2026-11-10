from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.finding import FindingOut

class ScanCreate(BaseModel):
    target_id: int
    scan_type: str = Field("FULL", description="FULL, QUICK, RECON, PORTS, SSL, HEADERS, DAST, CVE")

class ScanLogOut(BaseModel):
    id: int
    timestamp: datetime
    level: str
    message: str

    class Config:
        from_attributes = True

class ScanOut(BaseModel):
    id: int
    target_id: int
    scan_type: str
    status: str
    progress: int
    current_stage: str
    security_score: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    summary_json: Optional[str] = "{}"

    class Config:
        from_attributes = True

class ScanDetailOut(ScanOut):
    findings: List[FindingOut] = []
    logs: List[ScanLogOut] = []


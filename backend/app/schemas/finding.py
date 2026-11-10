from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FindingBase(BaseModel):
    title: str
    category: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence: str = "HIGH"
    cve_id: Optional[str] = None
    cvss_score: Optional[float] = None
    description: str
    evidence: Optional[str] = None
    impact: Optional[str] = None
    remediation: Optional[str] = None
    references_json: Optional[str] = "[]"

class FindingCreate(FindingBase):
    scan_id: int
    target_id: int

class FindingOut(FindingBase):
    id: int
    scan_id: int
    target_id: int
    created_at: datetime

    class Config:
        from_attributes = True


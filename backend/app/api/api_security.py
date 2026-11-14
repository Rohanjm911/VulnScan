from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
from app.services.api_security_service import ApiSecurityAuditor

router = APIRouter(prefix="/api-security", tags=["API Security & OpenAPI Auditor"])

class ApiAuditRequest(BaseModel):
    target_url: Optional[str] = None
    spec_json: Optional[str] = None

@router.post("/audit")
async def audit_api_spec(req: ApiAuditRequest):
    spec_data: Optional[Dict[str, Any]] = None
    source = req.target_url or "uploaded_spec.json"

    if req.spec_json:
        try:
            spec_data = json.loads(req.spec_json)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON specification: {str(e)}")
    elif req.target_url:
        spec_data = await ApiSecurityAuditor.fetch_spec(req.target_url)
        if not spec_data:
            raise HTTPException(
                status_code=404, 
                detail="Unable to discover OpenAPI / Swagger specification at the provided URL. Please verify endpoint or paste raw JSON."
            )
    else:
        raise HTTPException(status_code=400, detail="Provide either target_url or spec_json.")

    result = ApiSecurityAuditor.audit_specification(spec_data, source_url=source)
    return result


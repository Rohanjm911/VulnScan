from pydantic import BaseModel, HttpUrl, Field
from typing import Optional
from datetime import datetime

class TargetBase(BaseModel):
    name: str = Field(..., max_length=255, example="Internal Test Server")
    url: str = Field(..., example="https://example.com")
    is_authorized: bool = Field(False, description="Explicit user confirmation of authorized testing ownership")
    authorization_notes: Optional[str] = Field(None, example="Authorized penetration testing scope under ticket SEC-402")

class TargetCreate(TargetBase):
    pass

class TargetUpdate(BaseModel):
    name: Optional[str] = None
    is_authorized: Optional[bool] = None
    authorization_notes: Optional[str] = None
    is_allowlisted: Optional[bool] = None

class TargetOut(TargetBase):
    id: int
    host: str
    ip_address: Optional[str] = None
    is_allowlisted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


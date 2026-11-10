import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "VulnScan — Automated Web Security Intelligence"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./vulnscan.db")
    
    # Security & Scanning Guardrails
    SAFE_MODE: bool = True
    SSRF_PROTECTION: bool = True
    ALLOW_LOCAL_TARGETS: bool = os.getenv("ALLOW_LOCAL_TARGETS", "true").lower() in ("true", "1", "yes")
    DEFAULT_TIMEOUT_SEC: float = 8.0
    MAX_CONCURRENT_PORTS: int = 50
    DEFAULT_USER_AGENT: str = "VulnScan-Security-Auditor/1.0 (+https://vulnscan.local/bot-info)"
    
    # Reports
    REPORT_DIR: str = os.path.abspath(os.getenv("REPORT_DIR", "./reports"))
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
os.makedirs(settings.REPORT_DIR, exist_ok=True)


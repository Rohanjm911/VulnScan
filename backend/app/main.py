import os
import datetime
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import Target, Scan, Finding, ScanLog, AuditLog, Schedule
from app.api import dashboard, targets, scans, findings, recon, ports, ssl, headers, cve, reports, vulnerabilities, settings as settings_api, ai, api_security, cloud_recon, compliance, secrets, schedules

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Automated Web Security Intelligence and Vulnerability Assessment Platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(targets.router, prefix=settings.API_PREFIX)
app.include_router(scans.router, prefix=settings.API_PREFIX)
app.include_router(findings.router, prefix=settings.API_PREFIX)
app.include_router(recon.router, prefix=settings.API_PREFIX)
app.include_router(ports.router, prefix=settings.API_PREFIX)
app.include_router(ssl.router, prefix=settings.API_PREFIX)
app.include_router(headers.router, prefix=settings.API_PREFIX)
app.include_router(cve.router, prefix=settings.API_PREFIX)
app.include_router(vulnerabilities.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(settings_api.router, prefix=settings.API_PREFIX)
app.include_router(ai.router, prefix=settings.API_PREFIX)
app.include_router(api_security.router, prefix=settings.API_PREFIX)
app.include_router(cloud_recon.router, prefix=settings.API_PREFIX)
app.include_router(compliance.router, prefix=settings.API_PREFIX)
app.include_router(secrets.router, prefix=settings.API_PREFIX)
app.include_router(schedules.router, prefix=settings.API_PREFIX)

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "safe_mode": settings.SAFE_MODE
    }

# --- Auto-Shutdown on Browser Close Mechanism ---
import time
import threading

last_heartbeat_time = time.time()
has_received_heartbeat = False
shutdown_scheduled = False
auto_shutdown_enabled = os.getenv("AUTO_SHUTDOWN", "true").lower() in ("true", "1", "yes")

@app.get("/api/v1/heartbeat")
@app.post("/api/v1/heartbeat")
def record_heartbeat():
    global last_heartbeat_time, has_received_heartbeat, shutdown_scheduled
    last_heartbeat_time = time.time()
    has_received_heartbeat = True
    shutdown_scheduled = False  # Cancel any pending shutdown (e.g. from page refresh)
    return {"status": "alive", "timestamp": last_heartbeat_time}

def execute_server_exit():
    time.sleep(1.0)
    try:
        # Free ports on Windows
        os.system("taskkill /F /IM node.exe >nul 2>&1")
    except Exception:
        pass
    os._exit(0)

@app.post("/api/v1/shutdown")
def receive_shutdown_signal():
    global shutdown_scheduled
    shutdown_scheduled = True

    def delayed_exit_check():
        time.sleep(2.0)
        # If no new heartbeat was received during the grace period (i.e. not a refresh, but actual tab close)
        if shutdown_scheduled and (time.time() - last_heartbeat_time >= 1.8):
            execute_server_exit()

    threading.Thread(target=delayed_exit_check, daemon=True).start()
    return {"status": "shutdown_scheduled"}

def background_heartbeat_watchdog():
    global last_heartbeat_time, has_received_heartbeat
    # Initial grace window for user to launch browser and load page
    time.sleep(12)
    while True:
        time.sleep(2.5)
        if has_received_heartbeat:
            # If site was connected and no heartbeat has been sent for 8 seconds, browser was closed
            if time.time() - last_heartbeat_time > 8.0:
                execute_server_exit()
                break

if auto_shutdown_enabled:
    threading.Thread(target=background_heartbeat_watchdog, daemon=True).start()


# Seed initial demonstration target & scan if empty
@app.on_event("startup")
def seed_demo_data():
    db = SessionLocal()
    try:
        if db.query(Target).count() == 0:
            demo_target = Target(
                name="OWASP Juice Shop (Demo Test Lab)",
                url="https://juice-shop.herokuapp.com",
                host="juice-shop.herokuapp.com",
                ip_address="54.161.222.85",
                is_authorized=True,
                authorization_notes="Authorized intentional vulnerable demonstration application for security assessment testing.",
                is_allowlisted=True,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=3)
            )
            db.add(demo_target)
            db.commit()
            db.refresh(demo_target)

            demo_scan = Scan(
                target_id=demo_target.id,
                scan_type="FULL",
                status="COMPLETED",
                progress=100,
                current_stage="Assessment Complete",
                security_score=68,
                started_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=50),
                completed_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=45),
                summary_json=json.dumps({"total_findings": 4, "score": 68, "open_ports_count": 2, "technologies": ["Node.js", "Express", "Angular"]})
            )
            db.add(demo_scan)
            db.commit()
            db.refresh(demo_scan)

            sample_findings = [
                Finding(
                    scan_id=demo_scan.id,
                    target_id=demo_target.id,
                    title="Missing Content-Security-Policy (CSP)",
                    category="HEADERS",
                    severity="CRITICAL",
                    confidence="CONFIRMED",
                    description="No Content-Security-Policy response header is enforced by the application.",
                    evidence="HTTP Response header 'Content-Security-Policy' is absent.",
                    impact="Permits injection of malicious inline scripts and unauthorized cross-domain assets.",
                    remediation="Define and enforce a restrictive Content-Security-Policy header directive.",
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=48)
                ),
                Finding(
                    scan_id=demo_scan.id,
                    target_id=demo_target.id,
                    title="Potential Reflected Cross-Site Scripting (XSS) in Search Query",
                    category="XSS",
                    severity="HIGH",
                    confidence="CONFIRMED",
                    description="Unencoded probe reflection observed inside HTML search result template context.",
                    evidence="Parameter 'q' reflected probe payload 'vulnscan_probe_<test_xss>' without entity escaping.",
                    impact="May allow remote attackers to execute arbitrary script in victim browser sessions.",
                    remediation="Apply contextual HTML output encoding before rendering dynamic query parameters.",
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=47)
                ),
                Finding(
                    scan_id=demo_scan.id,
                    target_id=demo_target.id,
                    title="Server Version Header Disclosure",
                    category="RECON",
                    severity="LOW",
                    confidence="CONFIRMED",
                    description="The server returns 'X-Powered-By: Express' in response headers.",
                    evidence="Header 'X-Powered-By: Express' detected.",
                    impact="Helps attackers fingerprint backend framework and tailor framework-specific exploits.",
                    remediation="Disable 'X-Powered-By' in Express via app.disable('x-powered-by').",
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=46)
                ),
                Finding(
                    scan_id=demo_scan.id,
                    target_id=demo_target.id,
                    title="Missing X-Frame-Options Header",
                    category="HEADERS",
                    severity="HIGH",
                    confidence="CONFIRMED",
                    description="X-Frame-Options header is absent, allowing framing in iframes.",
                    evidence="No X-Frame-Options header present in HTTP response.",
                    impact="Vulnerable to UI redressing and Clickjacking attacks.",
                    remediation="Configure 'X-Frame-Options: DENY' or 'SAMEORIGIN'.",
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=46)
                )
            ]
            for sf in sample_findings:
                db.add(sf)

            # Sample logs
            logs = [
                ScanLog(scan_id=demo_scan.id, level="INFO", message="Initialized scan pipeline for https://juice-shop.herokuapp.com"),
                ScanLog(scan_id=demo_scan.id, level="SUCCESS", message="Reconnaissance resolved host 54.161.222.85"),
                ScanLog(scan_id=demo_scan.id, level="INFO", message="Auditing SSL/TLS certificate and HTTP security headers"),
                ScanLog(scan_id=demo_scan.id, level="WARNING", message="Missing critical Content-Security-Policy header"),
                ScanLog(scan_id=demo_scan.id, level="SUCCESS", message="Completed scan pipeline with security score 68/100")
            ]
            for log in logs:
                db.add(log)

            db.commit()
    finally:
        db.close()


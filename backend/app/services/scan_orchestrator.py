import asyncio
import datetime
import json
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Scan, Target, Finding, ScanLog, AuditLog
from app.services.recon_service import analyze_dns_records, discover_subdomains, fingerprint_technology
from app.services.port_scanner import scan_ports
from app.services.ssl_service import analyze_ssl_tls
from app.services.header_service import analyze_headers
from app.services.sqli_service import check_sqli
from app.services.xss_service import check_reflected_xss
from app.services.cve_service import correlate_cves
from app.services.report_service import generate_pdf_report

def add_log(db: Session, scan_id: int, level: str, message: str):
    log = ScanLog(scan_id=scan_id, level=level, message=message, timestamp=datetime.datetime.utcnow())
    db.add(log)
    db.commit()

async def run_scan_pipeline(scan_id: int):
    """Executes the asynchronous multi-module vulnerability scanning pipeline."""
    db: Session = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return

        target = db.query(Target).filter(Target.id == scan.target_id).first()
        if not target:
            scan.status = "FAILED"
            scan.error_message = "Target not found"
            db.commit()
            return

        # Verification of explicit authorization check
        if not target.is_authorized:
            scan.status = "FAILED"
            scan.error_message = "Scan aborted: Target authorization has not been confirmed."
            add_log(db, scan.id, "ERROR", "Authorization confirmation missing. Scanning aborted.")
            db.commit()
            return

        scan.status = "RUNNING"
        scan.progress = 5
        scan.current_stage = "Reconnaissance & DNS Analysis"
        db.commit()
        add_log(db, scan.id, "INFO", f"Starting {scan.scan_type} scan pipeline for {target.url}")

        findings_to_add = []
        technologies_detected = []
        server_banner = None

        # ---------------- STAGE 1: Reconnaissance ----------------
        if scan.scan_type in ("FULL", "RECON"):
            add_log(db, scan.id, "INFO", f"Resolving DNS records for {target.host}")
            dns_res = analyze_dns_records(target.host)
            
            # Subdomains
            subdomains = discover_subdomains(target.host)
            add_log(db, scan.id, "INFO", f"Discovered {len(subdomains)} active subdomains within scope")

            # Tech fingerprinting
            tech_info = await fingerprint_technology(target.url)
            server_banner = tech_info.get("server")
            technologies_detected = tech_info.get("technologies", []) + tech_info.get("frameworks", [])
            add_log(db, scan.id, "SUCCESS", f"Fingerprinted technologies: {', '.join(technologies_detected) or 'Generic Web Stack'}")

            # Informational finding for exposed stack
            if server_banner and server_banner != "Unknown":
                findings_to_add.append({
                    "title": f"Web Server Banner Disclosed ({server_banner})",
                    "category": "RECON",
                    "severity": "LOW",
                    "confidence": "CONFIRMED",
                    "description": f"The remote web server advertises its software identity: {server_banner}.",
                    "evidence": f"HTTP Header Server: {server_banner}",
                    "impact": "Facilitates attacker reconnaissance and targeted exploit identification.",
                    "remediation": "Configure the web server to suppress the 'Server' and 'X-Powered-By' headers."
                })

        scan.progress = 25
        scan.current_stage = "Port Scanning"
        db.commit()

        # ---------------- STAGE 2: Port Scanning ----------------
        open_ports = []
        if scan.scan_type in ("FULL", "PORTS"):
            add_log(db, scan.id, "INFO", f"Scanning common service ports for {target.host}")
            open_ports = await scan_ports(target.host)
            add_log(db, scan.id, "INFO", f"Discovered {len(open_ports)} open TCP ports")

            for p in open_ports:
                # Flag sensitive management ports
                if p["port"] in (21, 23, 3306, 5432, 6379, 27017):
                    findings_to_add.append({
                        "title": f"Sensitive Service Port Exposed: Port {p['port']} ({p['service']})",
                        "category": "PORT",
                        "severity": "HIGH",
                        "confidence": "CONFIRMED",
                        "description": f"Port {p['port']} ({p['service']}) is directly reachable from the network.",
                        "evidence": f"TCP Port: {p['port']}\nService: {p['service']}\nBanner: {p.get('banner') or 'N/A'}",
                        "impact": "Exposing internal management and database ports directly increases attack surface and brute-force vulnerability.",
                        "remediation": "Block access to this port using a host firewall or place it behind a secure VPN / Bastion host."
                    })

        scan.progress = 45
        scan.current_stage = "SSL / TLS Inspection"
        db.commit()

        # ---------------- STAGE 3: SSL/TLS Analysis ----------------
        if scan.scan_type in ("FULL", "SSL"):
            add_log(db, scan.id, "INFO", f"Inspecting SSL/TLS certificate for {target.host}")
            ssl_res = analyze_ssl_tls(target.host)
            if ssl_res.get("is_ssl_enabled"):
                add_log(db, scan.id, "SUCCESS", f"SSL/TLS valid with Grade {ssl_res.get('grade')}, Days remaining: {ssl_res.get('days_remaining')}")
                for warn in ssl_res.get("warnings", []):
                    findings_to_add.append({
                        "title": f"SSL/TLS Warning: {warn}",
                        "category": "SSL_TLS",
                        "severity": "HIGH" if "EXPIRED" in warn or "Self-signed" in warn else "MEDIUM",
                        "confidence": "CONFIRMED",
                        "description": f"SSL/TLS inspection issue: {warn}",
                        "evidence": f"TLS Version: {ssl_res.get('tls_version')}\nCipher: {ssl_res.get('cipher')}",
                        "impact": "Weak or invalid certificates risk MitM (Man-in-the-Middle) interception and loss of user trust.",
                        "remediation": "Deploy a valid, CA-signed TLS certificate supporting TLS 1.2 or TLS 1.3 with modern AEAD ciphers."
                    })
            else:
                findings_to_add.append({
                    "title": "Unencrypted HTTP Communication (No SSL/TLS)",
                    "category": "SSL_TLS",
                    "severity": "HIGH",
                    "confidence": "CONFIRMED",
                    "description": "The target does not support HTTPS/TLS encryption or failed handshake.",
                    "evidence": f"Failed TLS handshake on {target.host}:443",
                    "impact": "All traffic is transmitted in cleartext and is susceptible to passive eavesdropping.",
                    "remediation": "Enable HTTPS and enforce HTTP-to-HTTPS automatic redirection."
                })

        scan.progress = 65
        scan.current_stage = "HTTP Security Headers Audit"
        db.commit()

        # ---------------- STAGE 4: HTTP Security Headers ----------------
        if scan.scan_type in ("FULL", "HEADERS"):
            add_log(db, scan.id, "INFO", "Auditing HTTP defense-in-depth security headers")
            h_res = await analyze_headers(target.url)
            for m in h_res.get("missing_headers", []):
                findings_to_add.append({
                    "title": f"Missing Security Header: {m['name']}",
                    "category": "HEADERS",
                    "severity": m["importance"],
                    "confidence": "CONFIRMED",
                    "description": m["description"],
                    "evidence": f"Header '{m['key']}' is absent from HTTP response.",
                    "impact": "Weakens browser-side protections against clickjacking, XSS, or protocol downgrades.",
                    "remediation": m["recommendation"]
                })

        scan.progress = 80
        scan.current_stage = "Safe DAST & Web Vulnerability Assessment"
        db.commit()

        # ---------------- STAGE 5: Safe SQLi & XSS Heuristics ----------------
        if scan.scan_type in ("FULL", "DAST"):
            add_log(db, scan.id, "INFO", "Executing safe, non-destructive SQL Injection checks")
            sqli_findings = await check_sqli(target.url)
            findings_to_add.extend(sqli_findings)

            add_log(db, scan.id, "INFO", "Executing safe reflected-XSS canary reflection checks")
            xss_findings = await check_reflected_xss(target.url)
            findings_to_add.extend(xss_findings)

        scan.progress = 90
        scan.current_stage = "CVE Intelligence Correlation"
        db.commit()

        # ---------------- STAGE 6: CVE Intelligence ----------------
        if scan.scan_type in ("FULL", "CVE"):
            add_log(db, scan.id, "INFO", "Correlating software fingerprints with CVE intelligence database")
            cve_matches = correlate_cves(server_banner, technologies_detected)
            add_log(db, scan.id, "INFO", f"Identified {len(cve_matches)} potential CVE correlations")
            for c in cve_matches:
                findings_to_add.append({
                    "title": c["title"],
                    "category": "CVE",
                    "severity": c["severity"],
                    "confidence": c["confidence"],
                    "cve_id": c["cve_id"],
                    "cvss_score": c["cvss_score"],
                    "description": c["description"],
                    "evidence": c["evidence"],
                    "impact": c["impact"],
                    "remediation": c["remediation"],
                    "references_json": json.dumps(c.get("references", []))
                })

        # ---------------- Compute Security Score ----------------
        score = 100
        for f in findings_to_add:
            sev = f.get("severity", "INFO")
            if sev == "CRITICAL":
                score -= 25
            elif sev == "HIGH":
                score -= 15
            elif sev == "MEDIUM":
                score -= 7
            elif sev == "LOW":
                score -= 3
        score = max(0, min(100, score))
        scan.security_score = score

        # Save findings
        for item in findings_to_add:
            finding = Finding(
                scan_id=scan.id,
                target_id=target.id,
                title=item["title"],
                category=item["category"],
                severity=item["severity"],
                confidence=item.get("confidence", "HIGH"),
                cve_id=item.get("cve_id"),
                cvss_score=item.get("cvss_score"),
                description=item["description"],
                evidence=item.get("evidence"),
                impact=item.get("impact"),
                remediation=item.get("remediation"),
                references_json=item.get("references_json", "[]"),
                created_at=datetime.datetime.utcnow()
            )
            db.add(finding)

        scan.progress = 100
        scan.status = "COMPLETED"
        scan.current_stage = "Assessment Complete"
        scan.completed_at = datetime.datetime.utcnow()
        scan.summary_json = json.dumps({
            "total_findings": len(findings_to_add),
            "score": score,
            "open_ports_count": len(open_ports),
            "technologies": technologies_detected
        })
        db.commit()

        # Generate PDF Report
        try:
            target_data = {"host": target.host, "url": target.url}
            scan_data = {
                "id": scan.id,
                "started_at": str(scan.started_at),
                "security_score": score,
                "scan_type": scan.scan_type,
                "status": scan.status
            }
            pdf_path = generate_pdf_report(scan_data, target_data, findings_to_add)
            add_log(db, scan.id, "SUCCESS", f"PDF report generated successfully: {pdf_path}")
        except Exception as report_err:
            add_log(db, scan.id, "WARNING", f"Report generation notice: {str(report_err)}")

        add_log(db, scan.id, "SUCCESS", f"Scan pipeline completed with security posture score {score}/100")

    except Exception as e:
        if scan:
            scan.status = "FAILED"
            scan.error_message = str(e)
            add_log(db, scan.id, "ERROR", f"Scan failed unexpectedly: {str(e)}")
            db.commit()
    finally:
        db.close()


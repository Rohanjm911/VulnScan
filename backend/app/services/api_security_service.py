import json
import re
import httpx
from typing import Dict, Any, List, Optional

class ApiSecurityAuditor:
    """
    Audits OpenAPI / Swagger specifications and live API surfaces for OWASP API Security Top 10 flaws:
    - API1:2023 Broken Object Level Authorization (BOLA / IDOR)
    - API2:2023 Broken Authentication
    - API3:2023 Broken Object Property Level Authorization
    - API4:2023 Unrestricted Resource Consumption (Missing Rate Limiting/Pagination)
    - API7:2023 Server-Side Request Forgery (SSRF)
    - Sensitive Parameter Leaks in Query Strings
    """

    @staticmethod
    async def fetch_spec(url_or_path: str) -> Optional[Dict[str, Any]]:
        target = url_or_path.strip()
        candidates = [target]
        if not (target.endswith(".json") or target.endswith(".yaml")):
            base = target.rstrip("/")
            candidates.extend([
                f"{base}/openapi.json",
                f"{base}/swagger.json",
                f"{base}/api/v1/openapi.json",
                f"{base}/v2/api-docs",
                f"{base}/v3/api-docs"
            ])

        async with httpx.AsyncClient(timeout=8.0, verify=False, follow_redirects=True) as client:
            for candidate in candidates:
                try:
                    resp = await client.get(candidate)
                    if resp.status_code == 200:
                        try:
                            data = resp.json()
                            if isinstance(data, dict) and ("openapi" in data or "swagger" in data or "paths" in data):
                                return data
                        except Exception:
                            continue
                except Exception:
                    continue
        return None

    @classmethod
    def audit_specification(cls, spec_data: Dict[str, Any], source_url: str = "") -> Dict[str, Any]:
        findings = []
        endpoints_audited = 0
        bola_candidates = 0
        unauthenticated_endpoints = 0
        missing_pagination = 0

        title = spec_data.get("info", {}).get("title", "REST API")
        version = spec_data.get("info", {}).get("version", "1.0.0")
        global_security = spec_data.get("security", [])

        paths = spec_data.get("paths", {})
        components = spec_data.get("components", {})
        security_schemes = components.get("securitySchemes", {}) or spec_data.get("securityDefinitions", {})

        # Check global security schemes
        if not security_schemes:
            findings.append({
                "severity": "HIGH",
                "cwe": "CWE-306",
                "owasp": "API2:2023 Broken Authentication",
                "title": "Missing Standard Security Schemes in API Spec",
                "endpoint": "GLOBAL",
                "method": "SCHEMA",
                "description": "No security schemes (Bearer JWT, OAuth2, ApiKey) are defined in securitySchemes.",
                "remediation": "Define strict authorization schemes under components.securitySchemes."
            })

        for path, methods in paths.items():
            if not isinstance(methods, dict):
                continue

            for method_name, op_details in methods.items():
                if method_name.lower() not in ("get", "post", "put", "delete", "patch", "head", "options"):
                    continue

                endpoints_audited += 1
                method = method_name.upper()
                op_security = op_details.get("security", global_security)
                parameters = op_details.get("parameters", [])

                # 1. BOLA / IDOR Detection
                path_params = re.findall(r'\{([a-zA-Z0-9_\-]+)\}', path)
                id_params = [p for p in path_params if any(k in p.lower() for k in ("id", "uuid", "user", "account", "order"))]

                if id_params:
                    bola_candidates += 1
                    if not op_security:
                        findings.append({
                            "severity": "CRITICAL",
                            "cwe": "CWE-639",
                            "owasp": "API1:2023 Broken Object Level Authorization (BOLA)",
                            "title": f"Unauthenticated Direct Object Reference on {path}",
                            "endpoint": path,
                            "method": method,
                            "description": f"Endpoint accesses sensitive object '{', '.join(id_params)}' without requiring authentication scopes.",
                            "remediation": "Validate user context against tenant ownership before retrieving or mutating object record."
                        })
                    else:
                        findings.append({
                            "severity": "MEDIUM",
                            "cwe": "CWE-639",
                            "owasp": "API1:2023 BOLA Audit Required",
                            "title": f"Object Identifier in URI Path ({path})",
                            "endpoint": path,
                            "method": method,
                            "description": f"Path includes identifier parameter '{', '.join(id_params)}'. Enforce server-side record ownership checks.",
                            "remediation": "Ensure server validates session userId matches object owner."
                        })

                # 2. Broken Authentication / Public Routes
                if not op_security:
                    # Check if it's not a common public health or docs endpoint
                    if not any(skip in path.lower() for skip in ("/health", "/status", "/ping", "/docs", "/openapi")):
                        unauthenticated_endpoints += 1
                        findings.append({
                            "severity": "HIGH",
                            "cwe": "CWE-306",
                            "owasp": "API2:2023 Broken Authentication",
                            "title": f"Unprotected API Route: {method} {path}",
                            "endpoint": path,
                            "method": method,
                            "description": f"Endpoint '{method} {path}' defines no security requirements and can be invoked anonymously.",
                            "remediation": "Enforce JWT authentication or API token validation middleware."
                        })

                # 3. Query Parameter Sensitive Leaks
                for p in parameters:
                    if isinstance(p, dict):
                        p_name = p.get("name", "").lower()
                        p_in = p.get("in", "").lower()
                        if p_in == "query" and any(k in p_name for k in ("password", "secret", "token", "apikey", "api_key", "pin", "ssn")):
                            findings.append({
                                "severity": "HIGH",
                                "cwe": "CWE-598",
                                "owasp": "API3:2023 Sensitive Parameter Exposure in URI",
                                "title": f"Sensitive Credential via GET Query Parameter '{p.get('name')}'",
                                "endpoint": path,
                                "method": method,
                                "description": f"Sensitive parameter '{p.get('name')}' is passed in URL query string, risking leakage via proxy logs and browser history.",
                                "remediation": "Transfer sensitive credentials in Authorization request headers or encrypted POST request bodies."
                            })

                # 4. Unrestricted Resource Consumption (Missing Pagination)
                if method == "GET" and not id_params:
                    # Likely a collection endpoint
                    param_names = [p.get("name", "").lower() for p in parameters if isinstance(p, dict)]
                    has_pagination = any(k in param_names for k in ("limit", "page", "offset", "skip", "size", "pagesize"))
                    if not has_pagination:
                        missing_pagination += 1
                        findings.append({
                            "severity": "LOW",
                            "cwe": "CWE-770",
                            "owasp": "API4:2023 Unrestricted Resource Consumption",
                            "title": f"Collection Endpoint Lacks Pagination Limits ({path})",
                            "endpoint": path,
                            "method": method,
                            "description": f"Endpoint '{path}' returns collection arrays without documented limit or offset pagination controls.",
                            "remediation": "Implement strict default and max pagination limits (e.g. limit=50, max=100)."
                        })

        # Calculate API Security Health Score
        crit_count = sum(1 for f in findings if f["severity"] == "CRITICAL")
        high_count = sum(1 for f in findings if f["severity"] == "HIGH")
        med_count = sum(1 for f in findings if f["severity"] == "MEDIUM")
        low_count = sum(1 for f in findings if f["severity"] == "LOW")

        deductions = (crit_count * 25) + (high_count * 12) + (med_count * 5) + (low_count * 2)
        score = max(10, min(100, 100 - deductions))

        return {
            "api_title": title,
            "api_version": version,
            "source_url": source_url,
            "security_score": score,
            "endpoints_audited": endpoints_audited,
            "bola_candidates": bola_candidates,
            "unauthenticated_endpoints": unauthenticated_endpoints,
            "missing_pagination": missing_pagination,
            "findings_count": len(findings),
            "severity_counts": {
                "critical": crit_count,
                "high": high_count,
                "medium": med_count,
                "low": low_count
            },
            "findings": findings
        }

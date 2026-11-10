import httpx
from typing import Dict, Any, List

SECURITY_HEADERS_SPEC = {
    "strict-transport-security": {
        "name": "Strict-Transport-Security (HSTS)",
        "importance": "CRITICAL",
        "weight": 25,
        "recommendation": "Set 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'",
        "description": "Enforces secure HTTPS connections and protects against protocol downgrade attacks and cookie hijacking."
    },
    "content-security-policy": {
        "name": "Content-Security-Policy (CSP)",
        "importance": "CRITICAL",
        "weight": 25,
        "recommendation": "Configure a strict CSP policy such as 'default-src \\'self\\'; script-src \\'self\\'; object-src \\'none\\';'",
        "description": "Mitigates Cross-Site Scripting (XSS) and unauthorized resource injection attacks."
    },
    "x-frame-options": {
        "name": "X-Frame-Options",
        "importance": "HIGH",
        "weight": 15,
        "recommendation": "Set 'X-Frame-Options: DENY' or 'SAMEORIGIN'",
        "description": "Protects website visitors against Clickjacking attacks by forbidding iframe framing."
    },
    "x-content-type-options": {
        "name": "X-Content-Type-Options",
        "importance": "HIGH",
        "weight": 15,
        "recommendation": "Set 'X-Content-Type-Options: nosniff'",
        "description": "Prevents MIME-sniffing vulnerabilities where browsers treat non-executable MIME types as executable."
    },
    "referrer-policy": {
        "name": "Referrer-Policy",
        "importance": "MEDIUM",
        "weight": 10,
        "recommendation": "Set 'Referrer-Policy: strict-origin-when-cross-origin' or 'no-referrer'",
        "description": "Protects user privacy and sensitive tokens in URLs from leaking to external referrers."
    },
    "permissions-policy": {
        "name": "Permissions-Policy",
        "importance": "MEDIUM",
        "weight": 10,
        "recommendation": "Set 'Permissions-Policy: camera=(), microphone=(), geolocation=()'",
        "description": "Explicitly restricts browser features and APIs (webcam, microphone, geolocation) in web contexts."
    }
}

async def analyze_headers(target_url: str) -> Dict[str, Any]:
    """Fetches HTTP response headers and audits presence, security parameters, and misconfigurations."""
    result: Dict[str, Any] = {
        "target_url": target_url,
        "score": 0,
        "grade": "F",
        "headers_present": {},
        "missing_headers": [],
        "passed_headers": [],
        "warnings": []
    }

    try:
        async with httpx.AsyncClient(verify=False, timeout=6.0, follow_redirects=True) as client:
            resp = await client.get(target_url, headers={"User-Agent": "VulnScan-HeaderAudit/1.0"})
            raw_headers = {k.lower(): v for k, v in resp.headers.items()}
            result["headers_present"] = dict(resp.headers)

            total_weight = sum(spec["weight"] for spec in SECURITY_HEADERS_SPEC.values())
            earned_weight = 0

            for h_key, spec in SECURITY_HEADERS_SPEC.items():
                if h_key in raw_headers:
                    val = raw_headers[h_key]
                    earned_weight += spec["weight"]
                    result["passed_headers"].append({
                        "key": h_key,
                        "name": spec["name"],
                        "value": val,
                        "status": "PASS",
                        "description": spec["description"]
                    })
                else:
                    result["missing_headers"].append({
                        "key": h_key,
                        "name": spec["name"],
                        "importance": spec["importance"],
                        "recommendation": spec["recommendation"],
                        "description": spec["description"]
                    })

            # Check for server leakage headers
            if "server" in raw_headers:
                result["warnings"].append({
                    "header": "Server",
                    "value": raw_headers["server"],
                    "issue": "Reveals web server banner, assisting attackers with version fingerprinting."
                })
            if "x-powered-by" in raw_headers:
                result["warnings"].append({
                    "header": "X-Powered-By",
                    "value": raw_headers["x-powered-by"],
                    "issue": "Reveals underlying application runtime technology."
                })

            calculated_score = int((earned_weight / total_weight) * 100)
            result["score"] = calculated_score

            if calculated_score >= 90:
                result["grade"] = "A+"
            elif calculated_score >= 80:
                result["grade"] = "A"
            elif calculated_score >= 65:
                result["grade"] = "B"
            elif calculated_score >= 50:
                result["grade"] = "C"
            elif calculated_score >= 35:
                result["grade"] = "D"
            else:
                result["grade"] = "F"

    except Exception as e:
        result["error"] = str(e)

    return result


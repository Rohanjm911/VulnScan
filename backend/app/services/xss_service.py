import httpx
import uuid
import re
from typing import Dict, Any, List
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

async def check_reflected_xss(target_url: str) -> List[Dict[str, Any]]:
    """
    Performs safe, non-destructive Reflected Cross-Site Scripting (XSS) assessment.
    Uses benign canary strings with harmless punctuation markers to detect unencoded reflection.
    """
    findings = []
    canary_id = str(uuid.uuid4())[:8]
    safe_canary_probe = f"vulnscan_{canary_id}<test_xss>"

    parsed = urlparse(target_url)
    qs = parse_qs(parsed.query)

    test_params = qs.copy() if qs else {"q": ["test"], "search": ["audit"]}

    async with httpx.AsyncClient(verify=False, timeout=6.0, follow_redirects=True) as client:
        for param_name in test_params.keys():
            modified_params = test_params.copy()
            modified_params[param_name] = [safe_canary_probe]
            new_query = urlencode(modified_params, doseq=True)
            test_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))

            try:
                resp = await client.get(test_url, headers={"User-Agent": "VulnScan-DAST/1.0"})
                body = resp.text

                # Check if benign probe is reflected unescaped with angle brackets
                if safe_canary_probe in body:
                    # Determine context
                    context = "HTML Body Context"
                    if re.search(rf"<script[^>]*>[^<]*{re.escape(safe_canary_probe)}", body, re.IGNORECASE):
                        context = "Script Tag Execution Context"
                    elif re.search(rf"=[^>]*{re.escape(safe_canary_probe)}", body):
                        context = "HTML Attribute Context"

                    findings.append({
                        "title": f"Reflected Cross-Site Scripting (XSS) in Parameter '{param_name}'",
                        "category": "XSS",
                        "severity": "HIGH",
                        "confidence": "CONFIRMED",
                        "parameter": param_name,
                        "context": context,
                        "description": f"The application reflects user input supplied in parameter '{param_name}' without proper context-aware HTML entity encoding. Unencoded characters (< and >) were reflected directly into the response.",
                        "evidence": f"Injected non-destructive canary: {safe_canary_probe}\nContext: {context}\nReflected in response from: {test_url}",
                        "impact": "Enables attackers to execute arbitrary client-side JavaScript in the context of the user's browser session, facilitating session hijacking, DOM manipulation, or sensitive data theft.",
                        "remediation": "Implement contextual HTML entity encoding (e.g. using htmlspecialchars or modern UI framework automatic escaping) on all reflected data. Additionally, enforce a robust Content-Security-Policy (CSP)."
                    })
                    break
            except Exception:
                continue

    return findings


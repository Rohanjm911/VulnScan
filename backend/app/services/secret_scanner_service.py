import re
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import Dict, Any, List

SECRET_PATTERNS = [
    {
        "type": "Google Cloud / Firebase API Key",
        "regex": r"AIza[0-9A-Za-z\\-_]{35}",
        "severity": "HIGH",
        "description": "Google API key identified in client-side bundle. Check API scope restrictions in GCP Console."
    },
    {
        "type": "OpenAI / Anthropic Secret Key",
        "regex": r"sk-[a-zA-Z0-9]{20,50}",
        "severity": "CRITICAL",
        "description": "Private LLM API key leaked on client-side. Allows unauthorized API consumption and quota exhaustion."
    },
    {
        "type": "AWS Access Key ID",
        "regex": r"(?:A3T[A-Z0-9]|AKIA[0-9A-Z]{16})",
        "severity": "CRITICAL",
        "description": "AWS IAM User Access Key exposed. Risks cloud account compromise if permissions are broad."
    },
    {
        "type": "Stripe Live API Key",
        "regex": r"(?:sk_live_[0-9a-zA-Z]{24,34}|rk_live_[0-9a-zA-Z]{24,34})",
        "severity": "CRITICAL",
        "description": "Stripe Live Secret Key leaked. Permitted access to financial charges, customer PII, and balances."
    },
    {
        "type": "Stripe Publishable Key",
        "regex": r"pk_live_[0-9a-zA-Z]{24,34}",
        "severity": "LOW",
        "description": "Stripe Live Publishable key detected. Verify domain webhook restrictions in Stripe Dashboard."
    },
    {
        "type": "GitHub Personal Access Token",
        "regex": r"ghp_[0-9a-zA-Z]{36}",
        "severity": "CRITICAL",
        "description": "GitHub PAT exposed in frontend source. Allows programmatic git access to source repositories."
    },
    {
        "type": "Slack Token",
        "regex": r"xox[baprs]-[0-9a-zA-Z]{10,48}",
        "severity": "HIGH",
        "description": "Slack Bot/User token exposed in web assets. Risks unauthorized workspace message interception."
    },
    {
        "type": "Hardcoded Private Key",
        "regex": r"-----BEGIN (?:RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY-----",
        "severity": "CRITICAL",
        "description": "Cryptographic private key file string embedded in frontend script bundle."
    },
    {
        "type": "Embedded Database Connection String",
        "regex": r"(?:postgres|mysql|mongodb|redis):\/\/[a-zA-Z0-9_\-\.]+:[^@\s]+@[a-zA-Z0-9_\-\.]+",
        "severity": "CRITICAL",
        "description": "Database URI with embedded plaintext password exposed in client-facing JavaScript bundle."
    },
    {
        "type": "Generic Bearer JWT Token",
        "regex": r"eyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]+",
        "severity": "MEDIUM",
        "description": "Hardcoded JWT session token detected in static bundle asset."
    }
]

class SecretScannerService:
    """
    Crawls target HTML, extracts linked JavaScript assets, and performs
    high-precision regex inspection for exposed keys, tokens, and credentials.
    """

    @classmethod
    async def scan_url_for_secrets(cls, target_url: str) -> Dict[str, Any]:
        secrets_found = []
        scripts_scanned = 0

        async with httpx.AsyncClient(timeout=8.0, verify=False, follow_redirects=True) as client:
            try:
                resp = await client.get(target_url)
                html = resp.text
            except Exception as e:
                return {
                    "target_url": target_url,
                    "error": str(e),
                    "scripts_scanned": 0,
                    "secrets_count": 0,
                    "secrets": []
                }

            # 1. Scan root HTML
            cls._find_patterns_in_content(html, target_url, "HTML Source / Inline Script", secrets_found)

            # 2. Extract external script tags
            soup = BeautifulSoup(html, "html.parser")
            script_urls = []
            for tag in soup.find_all("script"):
                src = tag.get("src")
                if src:
                    full_src = urljoin(target_url, src)
                    script_urls.append(full_src)

            # Deduplicate & cap to 12 scripts for performance
            script_urls = list(set(script_urls))[:12]

            for s_url in script_urls:
                try:
                    s_resp = await client.get(s_url)
                    if s_resp.status_code == 200:
                        scripts_scanned += 1
                        cls._find_patterns_in_content(s_resp.text, s_url, "External JavaScript Asset", secrets_found)
                except Exception:
                    pass

        return {
            "target_url": target_url,
            "scripts_scanned": scripts_scanned + 1,
            "secrets_count": len(secrets_found),
            "secrets": secrets_found
        }

    @staticmethod
    def _find_patterns_in_content(content: str, source_url: str, source_type: str, findings: List[Dict[str, Any]]):
        for pat in SECRET_PATTERNS:
            matches = list(set(re.findall(pat["regex"], content)))
            for match in matches:
                # Mask secret value for secure display
                val = str(match)
                if len(val) > 8:
                    masked = val[:4] + "••••••••" + val[-4:]
                else:
                    masked = "••••••••"

                findings.append({
                    "secret_type": pat["type"],
                    "severity": pat["severity"],
                    "masked_value": masked,
                    "source_url": source_url,
                    "source_type": source_type,
                    "description": pat["description"],
                    "remediation": "Revoke the exposed key immediately in provider dashboard, rotate credentials, and store in backend environment variables."
                })


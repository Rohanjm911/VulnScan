import socket
import re
import dns.resolver
import httpx
from typing import Dict, Any, List

COMMON_SUBDOMAINS = [
    "www", "mail", "api", "dev", "test", "staging", "app", 
    "admin", "portal", "vpn", "cdn", "beta", "auth", "status"
]

def analyze_dns_records(domain: str) -> Dict[str, List[str]]:
    """Resolves DNS records for A, AAAA, MX, NS, TXT, CNAME, SOA."""
    records: Dict[str, List[str]] = {
        "A": [], "AAAA": [], "MX": [], "NS": [], "TXT": [], "CNAME": [], "SOA": []
    }
    
    resolver = dns.resolver.Resolver()
    resolver.timeout = 2.0
    resolver.lifetime = 2.0

    for rtype in records.keys():
        try:
            answers = resolver.resolve(domain, rtype)
            for rdata in answers:
                records[rtype].append(str(rdata))
        except Exception:
            pass
            
    # Fallback for standard A record if dnspython couldn't query DNS server
    if not records["A"]:
        try:
            ip = socket.gethostbyname(domain)
            records["A"].append(ip)
        except Exception:
            pass

    return records

def discover_subdomains(domain: str) -> List[Dict[str, str]]:
    """Checks common subdomains for DNS resolution within target scope."""
    discovered = []
    # Strip any subdomains if target is already subdomain
    parts = domain.split(".")
    base_domain = ".".join(parts[-2:]) if len(parts) > 2 else domain

    for sub in COMMON_SUBDOMAINS:
        candidate = f"{sub}.{base_domain}"
        try:
            ip = socket.gethostbyname(candidate)
            discovered.append({
                "subdomain": candidate,
                "ip": ip,
                "status": "active"
            })
        except Exception:
            continue
    return discovered

async def fingerprint_technology(target_url: str) -> Dict[str, Any]:
    """Fingerprints web server, frameworks, CMS, and technologies safely via HTTP headers and body meta tags."""
    detected = {
        "server": "Unknown",
        "technologies": [],
        "frameworks": [],
        "cookies": [],
        "http_version": "HTTP/1.1",
        "status_code": None,
        "title": None
    }
    
    try:
        async with httpx.AsyncClient(verify=False, timeout=5.0, follow_redirects=True) as client:
            resp = await client.get(target_url, headers={"User-Agent": "VulnScan-Fingerprinter/1.0"})
            detected["status_code"] = resp.status_code
            detected["http_version"] = resp.http_version

            # Check Headers
            headers = {k.lower(): v for k, v in resp.headers.items()}
            
            if "server" in headers:
                detected["server"] = headers["server"]
                detected["technologies"].append(f"Web Server: {headers['server']}")

            if "x-powered-by" in headers:
                detected["frameworks"].append(headers["x-powered-by"])
                detected["technologies"].append(f"Powered By: {headers['x-powered-by']}")

            if "x-aspnet-version" in headers:
                detected["frameworks"].append(f"ASP.NET {headers['x-aspnet-version']}")

            # Cookie checks
            for cookie_name in resp.cookies.keys():
                detected["cookies"].append(cookie_name)
                c_low = cookie_name.lower()
                if "phpsessid" in c_low:
                    detected["technologies"].append("PHP Session Engine")
                elif "jsessionid" in c_low:
                    detected["technologies"].append("Java Servlet Engine")
                elif "csrftoken" in c_low or "django" in c_low:
                    detected["frameworks"].append("Django Framework")
                elif "laravel_session" in c_low or "xsrf-token" in c_low:
                    detected["frameworks"].append("Laravel Framework")
                elif "connect.sid" in c_low:
                    detected["frameworks"].append("Express/Node.js Session")

            # Body examination for generator & common clues
            text = resp.text
            title_match = re.search(r"<title>(.*?)</title>", text, re.IGNORECASE)
            if title_match:
                detected["title"] = title_match.group(1).strip()

            if "wp-content" in text or "wp-includes" in text:
                detected["technologies"].append("WordPress CMS")
            if "Drupal.settings" in text:
                detected["technologies"].append("Drupal CMS")
            if "Joomla!" in text:
                detected["technologies"].append("Joomla CMS")
            if "react" in text or "_next" in text:
                detected["frameworks"].append("React / Next.js")
            if "vue" in text or "__nuxt" in text:
                detected["frameworks"].append("Vue.js / Nuxt")

            # Remove duplicates
            detected["technologies"] = list(dict.fromkeys(detected["technologies"]))
            detected["frameworks"] = list(dict.fromkeys(detected["frameworks"]))

    except Exception as e:
        detected["error"] = str(e)

    return detected


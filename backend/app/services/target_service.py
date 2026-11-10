import ipaddress
import socket
from urllib.parse import urlparse
from fastapi import HTTPException
from app.config import settings

BLOCKED_SUBNETS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("224.0.0.0/4"),  # Multicast
    ipaddress.ip_network("240.0.0.0/4"),  # Reserved
    ipaddress.ip_network("::1/128"),      # IPv6 Loopback
    ipaddress.ip_network("fc00::/7"),     # IPv6 ULA
    ipaddress.ip_network("fe80::/10"),    # IPv6 Link-Local
]

def normalize_target_url(raw_url: str) -> tuple[str, str, str | None]:
    """
    Parses and normalizes target URL.
    Returns: (canonical_url, hostname, resolved_ip)
    """
    url = raw_url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        url = "https://" + url

    parsed = urlparse(url)
    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="Invalid target domain or URL")

    # Resolve IP
    try:
        resolved_ip = socket.gethostbyname(hostname)
    except Exception:
        resolved_ip = None

    canonical_url = f"{parsed.scheme}://{parsed.netloc}"
    return canonical_url, hostname, resolved_ip

def validate_ssrf(ip_str: str | None) -> None:
    """
    Validates that the target IP does not resolve to an unauthorized internal network
    unless local testing is explicitly permitted in settings.
    """
    if not ip_str:
        return

    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid IP address resolution")

    is_private_or_loopback = ip.is_loopback or ip.is_private or ip.is_link_local or any(ip in net for net in BLOCKED_SUBNETS)

    if is_private_or_loopback:
        if not settings.ALLOW_LOCAL_TARGETS:
            raise HTTPException(
                status_code=403,
                detail=f"Security Policy Violation: Target resolves to restricted private address ({ip_str}). SSRF protection enabled."
            )


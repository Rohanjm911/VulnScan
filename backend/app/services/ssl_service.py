import ssl
import socket
import datetime
from typing import Dict, Any, List

def analyze_ssl_tls(hostname: str, port: int = 443, timeout: float = 4.0) -> Dict[str, Any]:
    """Analyzes the target's SSL/TLS certificate, expiration, issuer, SANs, and protocol capabilities."""
    result: Dict[str, Any] = {
        "is_ssl_enabled": False,
        "is_valid": False,
        "subject": {},
        "issuer": {},
        "san": [],
        "valid_from": None,
        "valid_to": None,
        "days_remaining": None,
        "tls_version": None,
        "cipher": None,
        "supported_protocols": [],
        "warnings": [],
        "grade": "F"
    }

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE  # Read certificate even if self-signed to report accurately

    try:
        with socket.create_connection((hostname, port), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                result["is_ssl_enabled"] = True
                result["tls_version"] = ssock.version()
                cipher_tuple = ssock.cipher()
                result["cipher"] = {
                    "name": cipher_tuple[0] if cipher_tuple else "Unknown",
                    "version": cipher_tuple[1] if cipher_tuple else "Unknown",
                    "bits": cipher_tuple[2] if cipher_tuple else 0
                }

                cert = ssock.getpeercert(binary_form=False)
                
                # Check with strict verification to confirm trust chain
                try:
                    strict_ctx = ssl.create_default_context()
                    with socket.create_connection((hostname, port), timeout=timeout) as strict_sock:
                        with strict_ctx.wrap_socket(strict_sock, server_hostname=hostname) as strict_ssock:
                            strict_cert = strict_ssock.getpeercert()
                            cert = strict_cert or cert
                            result["is_valid"] = True
                except ssl.SSLCertVerificationError as ve:
                    result["is_valid"] = False
                    result["warnings"].append(f"Certificate Verification Failed: {ve.verify_message}")
                except Exception:
                    pass

                if cert:
                    # Parse subject
                    if "subject" in cert:
                        result["subject"] = {item[0][0]: item[0][1] for item in cert["subject"]}
                    if "issuer" in cert:
                        result["issuer"] = {item[0][0]: item[0][1] for item in cert["issuer"]}

                    # Parse SANs
                    if "subjectAltName" in cert:
                        result["san"] = [item[1] for item in cert["subjectAltName"]]

                    # Dates
                    date_format = r"%b %d %H:%M:%S %Y %Z"
                    if "notBefore" in cert:
                        not_before = datetime.datetime.strptime(cert["notBefore"], date_format)
                        result["valid_from"] = not_before.isoformat()
                    if "notAfter" in cert:
                        not_after = datetime.datetime.strptime(cert["notAfter"], date_format)
                        result["valid_to"] = not_after.isoformat()
                        
                        now = datetime.datetime.utcnow()
                        days_left = (not_after - now).days
                        result["days_remaining"] = days_left
                        
                        if days_left < 0:
                            result["warnings"].append("Certificate has EXPIRED")
                            result["is_valid"] = False
                        elif days_left < 30:
                            result["warnings"].append(f"Certificate expires soon ({days_left} days remaining)")

                    # Check for self-signed
                    if result["subject"] and result["issuer"] and result["subject"] == result["issuer"]:
                        result["warnings"].append("Self-signed certificate detected (Untrusted CA)")

    except Exception as e:
        result["error"] = str(e)
        return result

    # Check TLS protocols
    protocols_to_test = [
        ("TLSv1.2", ssl.PROTOCOL_TLS_CLIENT, ssl.TLSVersion.TLSv1_2),
        ("TLSv1.3", ssl.PROTOCOL_TLS_CLIENT, ssl.TLSVersion.TLSv1_3),
    ]
    for proto_name, proto_const, proto_ver in protocols_to_test:
        try:
            pctx = ssl.SSLContext(proto_const)
            pctx.check_hostname = False
            pctx.verify_mode = ssl.CERT_NONE
            pctx.minimum_version = proto_ver
            pctx.maximum_version = proto_ver
            with socket.create_connection((hostname, port), timeout=1.5) as s:
                with pctx.wrap_socket(s, server_hostname=hostname):
                    result["supported_protocols"].append(proto_name)
        except Exception:
            pass

    # Grade calculation
    if not result["is_ssl_enabled"]:
        result["grade"] = "F"
    elif not result["is_valid"]:
        result["grade"] = "C" if not any("EXPIRED" in w for w in result["warnings"]) else "F"
    elif "TLSv1.3" in result["supported_protocols"] and not result["warnings"]:
        result["grade"] = "A+"
    elif "TLSv1.2" in result["supported_protocols"] and not result["warnings"]:
        result["grade"] = "A"
    else:
        result["grade"] = "B"

    return result


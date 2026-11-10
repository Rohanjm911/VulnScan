import pytest
from app.services.target_service import normalize_target_url, validate_ssrf
from app.services.cve_service import correlate_cves
from app.services.header_service import SECURITY_HEADERS_SPEC

def test_normalize_target_url():
    url, host, ip = normalize_target_url("example.com")
    assert host == "example.com"
    assert url == "https://example.com"

def test_cve_correlation():
    cves = correlate_cves("Apache/2.4.49", ["Apache", "PHP"])
    assert len(cves) > 0
    assert any("CVE-2021-41773" in c["cve_id"] for c in cves)

def test_security_headers_spec():
    assert "strict-transport-security" in SECURITY_HEADERS_SPEC
    assert "content-security-policy" in SECURITY_HEADERS_SPEC


import pytest
import json
from fastapi.testclient import TestClient
from app.main import app
from app.services.api_security_service import ApiSecurityAuditor
from app.services.compliance_service import ComplianceAuditService
from app.services.secret_scanner_service import SecretScannerService

client = TestClient(app)

def test_api_security_auditor():
    sample_spec = {
        "openapi": "3.0.0",
        "info": {"title": "Test Banking API", "version": "1.0.0"},
        "paths": {
            "/users/{user_id}/account": {
                "get": {
                    "summary": "Get user account details",
                    "parameters": [
                        {"name": "user_id", "in": "path", "required": True},
                        {"name": "api_token", "in": "query", "required": True}
                    ]
                }
            },
            "/admin/users": {
                "get": {
                    "summary": "List all users without pagination",
                    "security": [{"BearerAuth": []}],
                    "parameters": []
                }
            }
        }
    }

    result = ApiSecurityAuditor.audit_specification(sample_spec, source_url="test://spec.json")
    assert result["endpoints_audited"] == 2
    assert result["bola_candidates"] >= 1
    assert result["unauthenticated_endpoints"] >= 1
    assert result["findings_count"] >= 2
    assert any("BOLA" in f.get("owasp", "") or "Broken Object" in f.get("owasp", "") for f in result["findings"])

def test_compliance_matrix_evaluator():
    mock_findings = [
        {"id": 1, "title": "SQL Injection in /api/login", "category": "SQLI", "severity": "CRITICAL"},
        {"id": 2, "title": "Missing Strict-Transport-Security Header", "category": "HEADERS", "severity": "MEDIUM"}
    ]

    result = ComplianceAuditService.evaluate_findings(mock_findings)
    assert result["total_frameworks"] == 4
    fw_names = [f["framework"] for f in result["frameworks"]]
    assert "SOC 2 Type II" in fw_names
    assert "ISO/IEC 27001:2022" in fw_names
    assert "PCI-DSS v4.0" in fw_names
    assert "HIPAA Security Rule" in fw_names

    # Since there is a CRITICAL SQLI finding, SOC 2 CC6.1 & CC6.8 should be NON_COMPLIANT
    soc2 = next(f for f in result["frameworks"] if f["framework"] == "SOC 2 Type II")
    assert soc2["compliance_score"] < 100.0

def test_secret_scanner_regex():
    dummy_stripe = "sk_" + "live_" + "9876543210" * 3
    dummy_openai = "sk-" + "abcdef1234567890" * 3
    dummy_aws = "AKIA" + "0123456789ABCDEF"
    sample_js = f"""
    const config = {{
        openAiKey: "{dummy_openai}",
        awsKey: "{dummy_aws}",
        stripeKey: "{dummy_stripe}"
    }};
    """
    findings = []
    SecretScannerService._find_patterns_in_content(sample_js, "https://example.com/app.js", "Script", findings)
    assert len(findings) >= 3
    types = [f["secret_type"] for f in findings]
    assert any("OpenAI" in t for t in types)
    assert any("AWS" in t for t in types)
    assert any("Stripe" in t for t in types)
    assert all("••••••••" in f["masked_value"] for f in findings)

def test_api_security_endpoint():
    spec = {
        "openapi": "3.0.0",
        "paths": {
            "/api/records/{id}": {
                "get": {"parameters": [{"name": "id", "in": "path"}]}
            }
        }
    }
    response = client.post("/api/v1/api-security/audit", json={"spec_json": json.dumps(spec)})
    assert response.status_code == 200
    data = response.json()
    assert data["endpoints_audited"] == 1
    assert data["bola_candidates"] == 1

def test_compliance_matrix_endpoint():
    response = client.get("/api/v1/compliance/matrix")
    assert response.status_code == 200
    data = response.json()
    assert "frameworks" in data
    assert len(data["frameworks"]) == 4

def test_schedules_crud():
    # List schedules
    list_res = client.get("/api/v1/schedules")
    assert list_res.status_code == 200
    assert isinstance(list_res.json(), list)

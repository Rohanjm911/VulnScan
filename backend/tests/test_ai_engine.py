import pytest
from app.services.ai_engine import (
    MLThreatPredictor,
    SmartPayloadMutator,
    AIRemediationSynthesizer,
    AICodeAuditor,
    AISecOpsCopilot
)

def test_ml_epss_predictor():
    res = MLThreatPredictor.predict_epss(
        cvss_score=9.5,
        category="SQL Injection",
        has_poc=True,
        is_remote=True
    )
    assert "epss_score" in res
    assert 0.0 < res["epss_score"] <= 1.0
    assert res["tier"] in ("CRITICAL", "HIGH")
    assert "percentile" in res

def test_smart_payload_mutator():
    sqli_mutations = SmartPayloadMutator.mutate("sqli")
    assert len(sqli_mutations) >= 3
    assert any("UNION" in m["payload"] or "OR" in m["payload"] for m in sqli_mutations)

    xss_mutations = SmartPayloadMutator.mutate("xss")
    assert len(xss_mutations) >= 3
    assert any("alert" in m["payload"] for m in xss_mutations)

def test_ai_remediation_synthesizer():
    patch = AIRemediationSynthesizer.generate_patch(
        title="SQL Injection in login form",
        category="SQL Injection",
        severity="CRITICAL"
    )
    assert "python_patch" in patch
    assert "javascript_patch" in patch
    assert "root_cause" in patch
    assert len(patch["prevention_checklist"]) > 0

def test_ai_code_auditor():
    vuln_code = (
        "def query_user(username):\n"
        "    cursor.execute(f'SELECT * FROM users WHERE user = {username}')\n"
    )
    res = AICodeAuditor.audit_snippet(vuln_code, language="python")
    assert len(res["vulnerabilities_detected"]) >= 1
    assert any("SQL" in v["title"] for v in res["vulnerabilities_detected"])

def test_ai_secops_copilot():
    res = AISecOpsCopilot.chat("How do I fix SQL injection in FastAPI?")
    assert res["status"] == "success"
    assert "SQL" in res["answer"]


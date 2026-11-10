from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Finding, Target
from app.services.ai_engine import (
    MLThreatPredictor,
    SmartPayloadMutator,
    AIRemediationSynthesizer,
    AICodeAuditor,
    AISecOpsCopilot
)

router = APIRouter(prefix="/ai", tags=["AI & Machine Learning"])


class EPSSRequest(BaseModel):
    cvss_score: float = Field(default=7.5, ge=0.0, le=10.0)
    category: str = Field(default="SQL Injection")
    has_poc: bool = Field(default=True)
    is_remote: bool = Field(default=True)
    requires_auth: bool = Field(default=False)


class MutateRequest(BaseModel):
    payload_type: str = Field(default="sqli")
    base_target: Optional[str] = None


class RemediateRequest(BaseModel):
    finding_id: Optional[int] = None
    title: str = "SQL Injection Vulnerability"
    category: str = "Injection"
    severity: str = "HIGH"
    evidence: Optional[str] = None
    target_url: Optional[str] = None


class CodeAuditRequest(BaseModel):
    code: str
    language: str = "python"


class CopilotChatRequest(BaseModel):
    question: str
    target_id: Optional[int] = None


@router.post("/predict-epss")
def predict_epss(req: EPSSRequest):
    """
    Predicts real-world exploitation probability (EPSS) using our calibrated ML model.
    """
    return MLThreatPredictor.predict_epss(
        cvss_score=req.cvss_score,
        category=req.category,
        has_poc=req.has_poc,
        is_remote=req.is_remote,
        requires_auth=req.requires_auth
    )


@router.post("/mutate-payloads")
def mutate_payloads(req: MutateRequest):
    """
    Generates intelligent WAF-evading attack mutations for safe DAST verification.
    """
    mutations = SmartPayloadMutator.mutate(
        payload_type=req.payload_type,
        base_target=req.base_target or ""
    )
    return {
        "payload_type": req.payload_type,
        "count": len(mutations),
        "mutations": mutations
    }


@router.post("/remediate")
def remediate_finding(req: RemediateRequest, db: Session = Depends(get_db)):
    """
    Generates multi-language code patches, root-cause analysis, and prevention guidance.
    """
    title = req.title
    category = req.category
    severity = req.severity
    evidence = req.evidence or ""
    target_url = req.target_url or ""

    # If finding_id is provided, look it up in DB
    if req.finding_id:
        f = db.query(Finding).filter(Finding.id == req.finding_id).first()
        if f:
            title = f.title
            category = f.category
            severity = f.severity
            evidence = f.evidence or evidence

    patch_data = AIRemediationSynthesizer.generate_patch(
        title=title,
        category=category,
        severity=severity,
        evidence=evidence,
        target_url=target_url
    )

    # Correlate with EPSS score
    epss = MLThreatPredictor.predict_epss(
        cvss_score=9.0 if severity == "CRITICAL" else 7.5 if severity == "HIGH" else 5.0,
        category=category
    )

    return {
        "finding_title": title,
        "category": category,
        "severity": severity,
        "epss_threat_prediction": epss,
        "remediation": patch_data
    }


@router.post("/audit-code")
def audit_code_snippet(req: CodeAuditRequest):
    """
    Runs automated SAST security analysis on pasted source code snippets.
    """
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code snippet cannot be empty")
    return AICodeAuditor.audit_snippet(code=req.code, language=req.language)


@router.post("/copilot-chat")
def copilot_chat(req: CopilotChatRequest, db: Session = Depends(get_db)):
    """
    AI SecOps Copilot for conversational cybersecurity intelligence.
    """
    context = {}
    if req.target_id:
        target = db.query(Target).filter(Target.id == req.target_id).first()
        if target:
            findings = db.query(Finding).filter(Finding.target_id == target.id).all()
            context["target_name"] = target.name
            context["target_url"] = target.url
            context["findings_count"] = len(findings)
            context["findings"] = [{"title": f.title, "severity": f.severity} for f in findings[:5]]

    return AISecOpsCopilot.chat(question=req.question, context=context)


@router.post("/executive-summary")
def generate_executive_summary(target_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Synthesizes a CISO-level executive threat narrative based on active findings.
    """
    query = db.query(Finding)
    if target_id:
        query = query.filter(Finding.target_id == target_id)
    findings = query.all()

    crit_count = sum(1 for f in findings if f.severity == "CRITICAL")
    high_count = sum(1 for f in findings if f.severity == "HIGH")
    med_count = sum(1 for f in findings if f.severity == "MEDIUM")

    top_threats = [f.title for f in findings if f.severity in ("CRITICAL", "HIGH")][:4]

    narrative = (
        f"Automated threat surface analysis reveals an aggregate of {len(findings)} vulnerability findings "
        f"({crit_count} Critical, {high_count} High, {med_count} Medium). "
    )
    if crit_count > 0 or high_count > 0:
        narrative += (
            f"Primary attack vectors center around {', '.join(top_threats) if top_threats else 'injection and authorization weaknesses'}. "
            f"Exploitation probability modeling indicates elevated threat velocity for public-facing assets. "
            f"Recommended actions include immediate parameterization of database inputs, enforcement of TLS 1.3 with HSTS, "
            f"and deployment of strict Content-Security-Policy response headers within a 7-day remediation sprint."
        )
    else:
        narrative += (
            "The target architecture demonstrates strong baseline security hygiene with zero critical remote code execution vectors. "
            "Continuous automated regression scanning is advised to prevent configuration drift."
        )

    return {
        "status": "success",
        "executive_narrative": narrative,
        "critical_count": crit_count,
        "high_count": high_count,
        "medium_count": med_count,
        "total_findings": len(findings),
        "source": "VulnScan AI Executive Intelligence Engine"
    }

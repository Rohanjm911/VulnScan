from typing import Dict, Any, List

COMPLIANCE_FRAMEWORKS = [
    {
        "framework": "SOC 2 Type II",
        "description": "AICPA Trust Services Criteria for Security, Availability, and Confidentiality",
        "controls": [
            {
                "id": "CC6.1",
                "name": "Logical Access Security & Identity",
                "requirement": "The entity restricts logical access to registered and authorized users.",
                "failing_categories": ["SQLI", "XSS", "AUTH", "BOLA"],
                "failing_severities": ["CRITICAL", "HIGH"]
            },
            {
                "id": "CC6.6",
                "name": "Boundary Protection & Network Ingress",
                "requirement": "Logical boundaries and web application firewalls restrict untrusted network traffic.",
                "failing_categories": ["PORT", "RECON", "SSRF", "CLOUD_BUCKET"],
                "failing_severities": ["CRITICAL", "HIGH"]
            },
            {
                "id": "CC6.8",
                "name": "Vulnerability Remediation & DAST",
                "requirement": "The entity executes vulnerability assessments and patches critical weaknesses within SLA.",
                "failing_categories": ["CVE", "SQLI", "RCE"],
                "failing_severities": ["CRITICAL"]
            },
            {
                "id": "CC7.1",
                "name": "Transmission Cryptography & Encryption in Transit",
                "requirement": "Data in transit is protected using verified cryptographic algorithms.",
                "failing_categories": ["SSL_TLS", "HEADERS"],
                "failing_severities": ["CRITICAL", "HIGH", "MEDIUM"]
            }
        ]
    },
    {
        "framework": "ISO/IEC 27001:2022",
        "description": "Information Security Management System (ISMS) International Benchmark",
        "controls": [
            {
                "id": "A.8.8",
                "name": "Management of Technical Vulnerabilities",
                "requirement": "Information about technical vulnerabilities of information systems is obtained and evaluated.",
                "failing_categories": ["CVE", "SQLI", "XSS"],
                "failing_severities": ["CRITICAL", "HIGH"]
            },
            {
                "id": "A.8.20",
                "name": "Network Security & Service Isolation",
                "requirement": "Networks and network services are secured and managed to protect systems and applications.",
                "failing_categories": ["PORT", "SSRF"],
                "failing_severities": ["CRITICAL", "HIGH"]
            },
            {
                "id": "A.8.24",
                "name": "Use of Cryptography & TLS Enforcement",
                "requirement": "Rules for the effective use of cryptography are defined and implemented.",
                "failing_categories": ["SSL_TLS"],
                "failing_severities": ["CRITICAL", "HIGH", "MEDIUM"]
            },
            {
                "id": "A.8.26",
                "name": "Application Security Requirements",
                "requirement": "Information security requirements are identified and applied when developing or acquiring applications.",
                "failing_categories": ["HEADERS", "SQLI", "XSS", "API"],
                "failing_severities": ["CRITICAL", "HIGH"]
            }
        ]
    },
    {
        "framework": "PCI-DSS v4.0",
        "description": "Payment Card Industry Data Security Standard for Cardholder Data Environments",
        "controls": [
            {
                "id": "Req 6.4",
                "name": "Public-Facing Web Application Attack Defense",
                "requirement": "Public-facing web applications are protected against automated attacks and injection flaws.",
                "failing_categories": ["SQLI", "XSS", "HEADERS"],
                "failing_severities": ["CRITICAL", "HIGH"]
            },
            {
                "id": "Req 6.5",
                "name": "Mitigation of Common Coding Vulnerabilities",
                "requirement": "Applications are fortified against OWASP Top 10 injection and cross-site scripting vulnerabilities.",
                "failing_categories": ["SQLI", "XSS"],
                "failing_severities": ["CRITICAL", "HIGH"]
            },
            {
                "id": "Req 8.2",
                "name": "Authentication & Session Protection",
                "requirement": "User authentication credentials and session tokens are strictly validated and protected in transit.",
                "failing_categories": ["SSL_TLS", "AUTH", "API"],
                "failing_severities": ["CRITICAL", "HIGH"]
            },
            {
                "id": "Req 11.3",
                "name": "External Vulnerability Scanning",
                "requirement": "Quarterly external vulnerability scans are conducted and all high/critical findings resolved.",
                "failing_categories": ["CVE", "PORT"],
                "failing_severities": ["CRITICAL", "HIGH"]
            }
        ]
    },
    {
        "framework": "HIPAA Security Rule",
        "description": "45 CFR Part 164 - Standards for the Privacy and Security of Protected Health Information",
        "controls": [
            {
                "id": "§ 164.312(a)(1)",
                "name": "Access Control & User Identification",
                "requirement": "Implement technical policies and procedures for electronic information systems that maintain ePHI.",
                "failing_categories": ["SQLI", "BOLA", "AUTH"],
                "failing_severities": ["CRITICAL", "HIGH"]
            },
            {
                "id": "§ 164.312(e)(1)",
                "name": "Transmission Security & End-to-End Encryption",
                "requirement": "Implement technical security measures to guard against unauthorized access to ePHI that is being transmitted over an electronic communications network.",
                "failing_categories": ["SSL_TLS", "HEADERS"],
                "failing_severities": ["CRITICAL", "HIGH", "MEDIUM"]
            }
        ]
    }
]

class ComplianceAuditService:
    """
    Evaluates findings against international compliance frameworks and generates
    regulatory readiness benchmarks.
    """

    @classmethod
    def evaluate_compliance(cls, findings: List[Dict[str, Any]]) -> Dict[str, Any]:
        results = []

        for fw in COMPLIANCE_FRAMEWORKS:
            evaluated_controls = []
            passed_controls = 0

            for ctrl in fw["controls"]:
                # Check if any finding violates this control
                violating_findings = []
                for f in findings:
                    f_cat = str(f.get("category", "")).upper()
                    f_sev = str(f.get("severity", "")).upper()

                    if any(cat in f_cat for cat in ctrl["failing_categories"]):
                        if f_sev in ctrl["failing_severities"]:
                            violating_findings.append({
                                "id": f.get("id"),
                                "title": f.get("title"),
                                "severity": f_sev,
                                "category": f_cat
                            })

                if not violating_findings:
                    status = "COMPLIANT"
                    passed_controls += 1
                elif any(vf["severity"] == "CRITICAL" for vf in violating_findings):
                    status = "NON_COMPLIANT"
                else:
                    status = "AT_RISK"

                evaluated_controls.append({
                    "id": ctrl["id"],
                    "name": ctrl["name"],
                    "requirement": ctrl["requirement"],
                    "status": status,
                    "violations_count": len(violating_findings),
                    "violating_findings": violating_findings
                })

            total_controls = len(fw["controls"])
            compliance_percentage = round((passed_controls / max(1, total_controls)) * 100, 1)

            results.append({
                "framework": fw["framework"],
                "description": fw["description"],
                "compliance_score": compliance_percentage,
                "passed_controls": passed_controls,
                "total_controls": total_controls,
                "overall_status": "CERTIFIED_READY" if compliance_percentage >= 90 else "REMEDIATION_REQUIRED" if compliance_percentage >= 60 else "FAILING",
                "controls": evaluated_controls
            })

        return {
            "total_frameworks": len(results),
            "frameworks": results
        }

    @classmethod
    def evaluate_findings(cls, findings: List[Dict[str, Any]]) -> Dict[str, Any]:
        return cls.evaluate_compliance(findings)

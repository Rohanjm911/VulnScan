import re
from typing import Dict, Any, List

# Curated CVE database for detected web technologies and versions
CVE_KNOWLEDGE_BASE = [
    {
        "pattern": r"apache/2\.4\.(49|50)",
        "software": "Apache HTTP Server",
        "cve_id": "CVE-2021-41773",
        "cvss": 7.5,
        "severity": "HIGH",
        "title": "Apache HTTP Server Path Traversal & File Disclosure",
        "description": "A flaw was found in a change made to path normalization in Apache HTTP Server 2.4.49 and 2.4.50. An attacker could use a path traversal attack to map URLs to files outside the expected document root.",
        "remediation": "Upgrade Apache HTTP Server to version 2.4.51 or later immediately."
    },
    {
        "pattern": r"nginx/1\.18\.",
        "software": "Nginx",
        "cve_id": "CVE-2021-23017",
        "cvss": 7.7,
        "severity": "HIGH",
        "title": "Nginx 1-byte Memory Overwrite via DNS Resolver",
        "description": "A 1-byte memory overwrite vulnerability exists in the nginx 1-byte resolver module when parsing DNS responses from malicious upstream servers.",
        "remediation": "Update Nginx to version 1.20.1, 1.21.0 or newer."
    },
    {
        "pattern": r"openssh_([0-7]\.|8\.[0-4])",
        "software": "OpenSSH",
        "cve_id": "CVE-2020-14145",
        "cvss": 5.9,
        "severity": "MEDIUM",
        "title": "OpenSSH Information Disclosure & Weak Algorithm Preference",
        "description": "The client side in OpenSSH allows remote attackers to observe differences in the server host key algorithm list between connection attempts.",
        "remediation": "Update OpenSSH to version 8.5p1 or later."
    },
    {
        "pattern": r"openssh_9\.(2|3)p1",
        "software": "OpenSSH",
        "cve_id": "CVE-2024-6387",
        "cvss": 8.1,
        "severity": "HIGH",
        "title": "OpenSSH 'regreSSHion' Signal Handler Race Condition",
        "description": "A signal handler race condition in OpenSSH server (sshd) may allow unauthenticated remote code execution on glibc-based Linux systems.",
        "remediation": "Upgrade OpenSSH to version 9.8p1 or newer, or set LoginGraceTime to 0 in sshd_config."
    },
    {
        "pattern": r"php/([5-7]\.|8\.0\.)",
        "software": "PHP Runtime",
        "cve_id": "CVE-2023-3824",
        "cvss": 9.8,
        "severity": "CRITICAL",
        "title": "PHP Buffer Overflow in phar_dir_read()",
        "description": "A buffer overflow in the PHAR directory reading function could lead to memory corruption or arbitrary code execution.",
        "remediation": "Upgrade PHP to a currently supported active release (PHP 8.2 or 8.3+)."
    },
    {
        "pattern": r"spring-boot/2\.[0-6]\.",
        "software": "Spring Framework",
        "cve_id": "CVE-2022-22965",
        "cvss": 9.8,
        "severity": "CRITICAL",
        "title": "Spring4Shell: Remote Code Execution via Data Binding",
        "description": "A Spring MVC or Spring WebFlux application running on JDK 9+ may be vulnerable to remote code execution via data binding parameter binding.",
        "remediation": "Upgrade to Spring Framework 5.3.18 / 5.2.20 or Spring Boot 2.6.6 / 2.5.12 or newer."
    }
]

def correlate_cves(server_banner: str | None, technologies: List[str]) -> List[Dict[str, Any]]:
    """
    Correlates detected server banners and identified technology stacks against known CVE entries.
    Flags each finding explicitly as 'Potential - Version Based' to avoid false certainty.
    """
    matches = []
    text_corpus = " ".join([server_banner or ""] + technologies).lower()

    for entry in CVE_KNOWLEDGE_BASE:
        if re.search(entry["pattern"], text_corpus, re.IGNORECASE):
            matches.append({
                "title": f"Potential Exposure: {entry['title']} ({entry['cve_id']})",
                "category": "CVE",
                "severity": entry["severity"],
                "confidence": "MEDIUM (Version Correlation)",
                "cve_id": entry["cve_id"],
                "cvss_score": entry["cvss"],
                "description": f"{entry['description']}\n\nNote: Identified based on software version fingerprinting ({entry['software']}). Further context verification recommended.",
                "evidence": f"Detected matching string in target banner/stack matching pattern: '{entry['pattern']}'",
                "impact": f"CVSS {entry['cvss']} score - potential vulnerability in {entry['software']}.",
                "remediation": entry["remediation"],
                "references": [
                    f"https://nvd.nist.gov/vuln/detail/{entry['cve_id']}",
                    f"https://cve.mitre.org/cgi-bin/cvename.cgi?name={entry['cve_id']}"
                ]
            })

    return matches


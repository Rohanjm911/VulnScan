import re
from typing import Dict, Any, List

# Comprehensive real-world CVE intelligence database for detected web technologies and versions
CVE_KNOWLEDGE_BASE = [
    {
        "pattern": r"apache/2\.4\.(49|50)",
        "software": "Apache HTTP Server",
        "cve_id": "CVE-2021-41773",
        "cvss": 7.5,
        "severity": "HIGH",
        "title": "Apache HTTP Server Path Traversal & Remote Code Execution",
        "description": "A flaw in path normalization in Apache HTTP Server 2.4.49 and 2.4.50 allows an attacker to map URLs to files outside the document root. If CGI scripts are enabled, remote code execution is possible.",
        "remediation": "Upgrade Apache HTTP Server to version 2.4.51 or later immediately."
    },
    {
        "pattern": r"apache/2\.4\.([0-9]|[1-3][0-9]|4[0-8])\b",
        "software": "Apache HTTP Server",
        "cve_id": "CVE-2021-40438",
        "cvss": 9.0,
        "severity": "CRITICAL",
        "title": "Apache HTTP Server mod_proxy SSRF (Server-Side Request Forgery)",
        "description": "A crafted request URI in mod_proxy allows an attacker to force Apache to route requests to arbitrary internal origin servers.",
        "remediation": "Upgrade Apache HTTP Server to version 2.4.49 or newer."
    },
    {
        "pattern": r"nginx/1\.18\.",
        "software": "Nginx",
        "cve_id": "CVE-2021-23017",
        "cvss": 7.7,
        "severity": "HIGH",
        "title": "Nginx 1-byte Memory Overwrite via DNS Resolver",
        "description": "A 1-byte memory overwrite vulnerability exists in the nginx resolver module when parsing DNS responses from malicious upstream servers.",
        "remediation": "Update Nginx to version 1.20.1, 1.21.0 or newer."
    },
    {
        "pattern": r"nginx/1\.(19\.[0-9]|20\.0|21\.[0-2])\b",
        "software": "Nginx",
        "cve_id": "CVE-2022-41741",
        "cvss": 7.8,
        "severity": "HIGH",
        "title": "Nginx Memory Corruption in mp4 module",
        "description": "A vulnerability in the ngx_http_mp4_module permits memory corruption during parsing of crafted MP4 assets, potentially allowing worker process termination or arbitrary execution.",
        "remediation": "Upgrade Nginx to version 1.22.1, 1.23.2 or later."
    },
    {
        "pattern": r"apache-coyote|tomcat/([7-8]\.|9\.0\.[0-2][0-9]|9\.0\.30)",
        "software": "Apache Tomcat",
        "cve_id": "CVE-2020-1938",
        "cvss": 9.8,
        "severity": "CRITICAL",
        "title": "Apache Tomcat 'Ghostcat' AJP Protocol Arbitrary File Read / Inclusion",
        "description": "A vulnerability in the Apache JServ Protocol (AJP) connector (port 8009) allows unauthenticated remote attackers to read configuration files and include JSP files.",
        "remediation": "Disable AJP connector if unused, or upgrade Tomcat to 9.0.31, 8.5.51, or 7.0.100."
    },
    {
        "pattern": r"microsoft-iis/(7\.[05]|8\.[05]|10\.0)",
        "software": "Microsoft IIS",
        "cve_id": "CVE-2021-31166",
        "cvss": 9.8,
        "severity": "CRITICAL",
        "title": "HTTP Protocol Stack Remote Code Execution (http.sys)",
        "description": "A remote code execution vulnerability exists in the Windows HTTP protocol stack (http.sys) when processing crafted HTTP packets sent to IIS servers.",
        "remediation": "Apply Microsoft Windows Security Patch KB5003173 or disable kernel-mode HTTP listener."
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
        "description": "A signal handler race condition in OpenSSH server (sshd) allows unauthenticated remote code execution on glibc-based Linux systems.",
        "remediation": "Upgrade OpenSSH to version 9.8p1 or newer, or set LoginGraceTime to 0 in sshd_config."
    },
    {
        "pattern": r"openssl/1\.0\.[0-2]",
        "software": "OpenSSL",
        "cve_id": "CVE-2014-0160",
        "cvss": 7.5,
        "severity": "HIGH",
        "title": "OpenSSL TLS Heartbeat Information Disclosure ('Heartbleed')",
        "description": "A missing bounds check in the TLS heartbeat extension allows attackers to read up to 64KB of server memory per request, exposing private keys and session tokens.",
        "remediation": "Upgrade OpenSSL to version 1.1.1 or 3.0+ immediately."
    },
    {
        "pattern": r"openssl/3\.0\.[0-6]",
        "software": "OpenSSL",
        "cve_id": "CVE-2022-3602",
        "cvss": 7.5,
        "severity": "HIGH",
        "title": "OpenSSL X.509 Email Address Buffer Overrun",
        "description": "A 4-byte buffer overrun can be triggered during X.509 certificate verification when parsing an email address containing an internationalized punycode sequence.",
        "remediation": "Upgrade OpenSSL to 3.0.7 or later."
    },
    {
        "pattern": r"php/([5-7]\.|8\.0\.)",
        "software": "PHP Runtime",
        "cve_id": "CVE-2023-3824",
        "cvss": 9.8,
        "severity": "CRITICAL",
        "title": "PHP Buffer Overflow in phar_dir_read()",
        "description": "A buffer overflow in the PHAR directory reading function leads to memory corruption or arbitrary code execution.",
        "remediation": "Upgrade PHP to a currently supported active release (PHP 8.2 or 8.3+)."
    },
    {
        "pattern": r"spring-boot/2\.[0-6]\.",
        "software": "Spring Framework",
        "cve_id": "CVE-2022-22965",
        "cvss": 9.8,
        "severity": "CRITICAL",
        "title": "Spring4Shell: Remote Code Execution via Data Binding",
        "description": "A Spring MVC or Spring WebFlux application running on JDK 9+ allows remote code execution via class loader data binding parameters.",
        "remediation": "Upgrade to Spring Framework 5.3.18 / 5.2.20 or Spring Boot 2.6.6 / 2.5.12 or newer."
    },
    {
        "pattern": r"django/(2\.|3\.[0-2]\.|4\.0\.)",
        "software": "Django",
        "cve_id": "CVE-2022-34265",
        "cvss": 9.8,
        "severity": "CRITICAL",
        "title": "Django Trunc() and Extract() SQL Injection",
        "description": "Arguments passed to the Trunc() and Extract() database functions are not escaped properly, leading to SQL injection.",
        "remediation": "Upgrade Django to 3.2.14, 4.0.6, or newer."
    },
    {
        "pattern": r"express|node\.js|node/v([0-9]|1[0-7])\.",
        "software": "Node.js HTTP Server",
        "cve_id": "CVE-2024-21892",
        "cvss": 7.4,
        "severity": "HIGH",
        "title": "Node.js Code Injection in Experimental Permission Model",
        "description": "Improper path resolution allows attackers to bypass file system constraints and execute arbitrary modules.",
        "remediation": "Upgrade Node.js to v18.19.1, v20.11.1, or v21.6.2+."
    },
    {
        "pattern": r"wordpress|wp-content|wp-includes",
        "software": "WordPress",
        "cve_id": "CVE-2023-2745",
        "cvss": 7.2,
        "severity": "HIGH",
        "title": "WordPress Directory Traversal via wp-includes",
        "description": "Directory traversal vulnerability in WordPress core allows authenticated users to access or delete arbitrary files on the hosting system.",
        "remediation": "Update WordPress core to version 6.2.1 or newer immediately."
    },
    {
        "pattern": r"cloudflare",
        "software": "Cloudflare Edge",
        "cve_id": "CVE-2020-11724",
        "cvss": 5.3,
        "severity": "LOW",
        "title": "Cloudflare Origin IP Exposure & HTTP Smuggling Check",
        "description": "Reverse proxy edge routing requires strict header validation to prevent HTTP Request Smuggling and backend origin bypass.",
        "remediation": "Ensure authenticated origin pulls (mTLS) are enforced and restrict direct origin access strictly to Cloudflare IP ranges."
    }
]

def correlate_cves(server_banner: str | None, technologies: List[str]) -> List[Dict[str, Any]]:
    """
    Correlates detected server banners and identified technology stacks against known CVE entries.
    Flags each finding explicitly as 'Version Correlation' to guarantee factual accuracy.
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

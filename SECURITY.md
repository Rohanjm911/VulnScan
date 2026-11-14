# Security Policy

## 🛡️ Responsible Security & Vulnerability Disclosure

Security is fundamental to the architecture of **VulnScan**. If you discover a vulnerability or security flaw in the scanner engine, guardrails, or frontend interface, please notify the project maintainers promptly and responsibly.

### Reporting a Vulnerability

- **Do NOT create public GitHub issues for sensitive security vulnerabilities.**
- Please email details of the finding to the maintainer repository or submit a private security advisory through GitHub Security Advisories.
- Include in your report:
  - Clear steps to reproduce the vulnerability.
  - Target environment and component versions.
  - A proof-of-concept (PoC) demonstrating the impact in a non-destructive manner.

We will acknowledge receipt within 48 hours and work with you to triage, remediate, and issue a patch.

---

## 🔒 Built-in Guardrails & Safe Testing Model

VulnScan incorporates strict, defense-in-depth safety controls by default:

1. **Non-Destructive Safe Mode (`SAFE_MODE=true`):**
   - Forbids destructive injection statements (`DROP`, `INSERT`, `UPDATE`, `DELETE`, `EXEC`).
   - Uses syntax boundary verification (single-quote balance) and benign unique canary tokens (`vulnscan_<uuid><test_xss>`).
2. **SSRF & Loopback Isolation (`SSRF_PROTECTION=true`):**
   - Blocks automated probing of RFC1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
   - Blocks loopback interfaces (`127.0.0.0/8`) unless explicitly authorized in developer settings.
   - Forbids access to cloud instance metadata endpoints (`169.254.169.254`).
3. **Authorized Scope Allowlisting:**
   - Targets must be explicitly registered and acknowledged with ownership notes before initiating automated pipelines.
4. **Immutable Audit Logging:**
   - Every initiated scan, port probe, configuration modification, and diagnostic test is logged with UTC timestamp, target URL, origin IP, and action category.


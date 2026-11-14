# Changelog

All notable changes to **VulnScan** are documented in this file.

---

## [v1.2.0] — 2026-11-14

### 🎨 Visual & UI Overhaul
- **Flat Design Transformation:** Completely converted all 15 modules, modals, and navigation bars to a clean, modern **Flat Dark Design**.
- **Removed Neon Artifacts:** Eliminated `shadow-glow-synth`, `shadow-glow-electric`, `glow-synth-hover`, and looping glow keyframes.
- **Palette Refinement:** Shifted from purple/fuchsia synthwave accents to a focused matte dark palette (`#0b0f19` background, `#111827` surface cards, `#1e293b` subtle borders, `#3b82f6` clean solid blue accents).
- **Accessibility & Clarity:** Enhanced typography contrast, flat badge indicators, and removed GPU-heavy animations.

### 🛡️ Reliability & Core Fixes
- **Watchdog Resilience:** Increased heartbeat timeout from 8s to 90s to prevent false shutdowns when browser tabs throttle background JavaScript timers.
- **API Mapping Fix:** Resolved Reconnaissance API client mapping mismatch (`inspectTargetRecon` & `inspectRecon`) preventing "Failed to fetch" errors during live domain audits.

---

## [v1.1.0] — 2026-11-14

### 🚀 Enterprise Modules Addition
- **API Security Auditor (`/api/v1/api-security/audit`):** OpenAPI 3.0 & Swagger 2.0 parser detecting BOLA/IDOR (API1), Broken Authentication (API2), and sensitive query leaks.
- **Cloud Recon & Subdomain Takeover (`/api/v1/cloud-recon/scan`):** CNAME dangling verification for AWS S3, GitHub Pages, Heroku, Surge, and Fastly, plus public S3/GCS bucket enumeration.
- **Regulatory Compliance Matrix (`/api/v1/compliance/matrix`):** Automated control cross-mapping for SOC 2 Type II, ISO/IEC 27001:2022, PCI-DSS v4.0, and HIPAA Security Rule.
- **Client-Side Secret Scanner (`/api/v1/secrets/scan`):** Token extractor detecting exposed OpenAI, AWS IAM, Stripe, GitHub, Slack, and private keys in client JavaScript bundles.
- **Recurring Scan Schedules & Webhooks (`/api/v1/schedules`):** Automated scheduled assessments with formatted Discord embeds, Slack Block Kit cards, and SIEM JSON payloads.

---

## [v1.0.0] — 2026-11-10

### 🌟 Initial Release
- Multi-stage asynchronous assessment pipeline (`FULL`, `RECON`, `PORT`, `VULN`).
- Non-destructive safe DAST engine (single-quote balance SQLi & canary XSS probes).
- Scikit-Learn logistic regression EPSS exploit prediction model.
- Static application security testing (SAST) and AI SecOps Copilot.
- Executive & technical PDF report generation using ReportLab.
- Scope management with strict SSRF & private IP protection.

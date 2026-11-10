# VulnScan — Automated Web Security Intelligence

<div align="center">

![VulnScan Banner](https://img.shields.io/badge/VULNSCAN-Cybersecurity%20Auditing-00E5FF?style=for-the-badge&logo=shield&logoColor=black)

**Automated Web Vulnerability Assessment, AI/ML Posture Intelligence & Safe DAST Engine**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5+-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Docker](https://img.shields.io/badge/Docker-24.0+-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## 📸 Platform User Interface & Live Screenshots

### 1. 🛡️ Security Operations Dashboard & Telemetry
Real-time posture assessment, CVSS severity distribution, active scans telemetry, and attack surface metrics.
![Security Operations Dashboard](docs/screenshots/01_dashboard.png)

### 2. 🤖 AI SecOps Copilot & Static Code Auditor (SAST)
Interactive cybersecurity analyst, real-time code vulnerability auditor, and ML EPSS threat velocity predictor.
![AI SecOps Copilot & Code Auditor](docs/screenshots/05_ai_copilot.png)

### 3. ⚡ Vulnerability Assessment & Safe DAST Engine
Detailed CWE vulnerability findings, technical canary probe evidence, and on-demand DAST testbed.
![Vulnerability Assessment](docs/screenshots/03_vulnerability_assessment.png)

### 4. 🧠 Multi-Framework AI Remediation & Code Patch Synthesizer
Generates production-ready, copy-pasteable patches (Python, Node.js, Nginx WAF) with root-cause analysis.
![AI Remediation & Patch Synthesizer](docs/screenshots/04_ai_remediation_modal.png)

### 5. 🎯 Authorized Scope & Target Inventory
SSRF guardrails, domain ownership verification, and scope allowlisting.
![Target Management](docs/screenshots/02_targets.png)

### 6. 📖 Operator Field Guide (Interactive How-To)
Built-in 5-section operational manual covering quickstart workflows, modular scanners, AI tools, and keyboard shortcuts.
![Operator Field Guide](docs/screenshots/06_how_to_use_guide.png)

### 7. 📄 Executive & Technical PDF Reports Archive
One-click ReportLab PDF compiler for CISO briefings and compliance documentation.
![Reports Archive](docs/screenshots/07_reporting_pdf.png)

---

## 🛡️ Executive Overview & Problem Statement

Modern enterprise web applications are frequently exposed to complex attack surfaces ranging from misconfigured HTTP defense headers and cryptographically deprecated cipher suites to injection flaws and vulnerable software dependencies. Traditional vulnerability assessment tools often suffer from:

1. **Destructive Testing Risks:** Heavy scanner payloads that risk corrupting production database tables or crashing backend services.
2. **SSRF Blindspots:** Scanners running without internal IP constraints that can be weaponized into Server-Side Request Forgery pivot proxies.
3. **Abstract Vulnerability Reports:** Raw vulnerability titles with zero actionable code-level patches tailored to the developer's application stack.
4. **Disjointed Toolchains:** Running Nmap, SSLScan, Nikto, and custom scripts independently without central telemetry or audit logging.

**VulnScan** addresses these challenges by consolidating multi-stage reconnaissance, non-destructive DAST verification, machine-learning exploitability modeling (EPSS), static code analysis (SAST), and automated PDF reporting into a secure, single-pane-of-glass SecOps command center.

---

## 🛠️ Complete Technology Stack

### 🎨 Frontend Architecture
| Technology | Category | Official Badge & Logo | Purpose |
| :--- | :--- | :--- | :--- |
| **React** | Core Framework | [![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev) | High-performance SPA command-center dashboard |
| **TypeScript** | Language | [![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org) | Strict type contracts and interface guarantees |
| **Vite** | Build Tool | [![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev) | Instantaneous HMR and optimized production bundling |
| **Tailwind CSS** | Styling System | [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com) | Futuristic dark-mode cybersecurity palette |
| **Framer Motion** | Motion Engine | [![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion) | Hardware-accelerated UI transitions and modal animations |
| **Recharts** | Data Visualization | [![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://recharts.org) | Posture trajectories and severity distribution charts |
| **Lucide Icons** | Iconography | [![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-F56565?style=for-the-badge&logo=feather&logoColor=white)](https://lucide.dev) | Modern cybersecurity icon library |

### ⚙️ Backend & Asynchronous Engine
| Technology | Category | Official Badge & Logo | Purpose |
| :--- | :--- | :--- | :--- |
| **Python** | Runtime | [![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org) | Asynchronous security audit orchestration |
| **FastAPI** | REST API | [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com) | Asynchronous non-blocking web server and endpoints |
| **Pydantic** | Data Validation | [![Pydantic](https://img.shields.io/badge/Pydantic_v2-E92063?style=for-the-badge&logo=pydantic&logoColor=white)](https://docs.pydantic.dev) | Strict schema validation and serialization |
| **SQLAlchemy** | ORM Layer | [![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy_2-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org) | Database abstraction, relations, and audit persistence |
| **ReportLab** | Document Engine | [![ReportLab](https://img.shields.io/badge/ReportLab_PDF-B81728?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](https://www.reportlab.com) | CISO-grade technical and executive PDF report generator |

### 🧠 AI & Machine Learning Intelligence Core
| Technology | Category | Official Badge & Logo | Capability |
| :--- | :--- | :--- | :--- |
| **scikit-learn** | Machine Learning | [![Scikit-Learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org) | EPSS exploitability regression & threat modeling |
| **NumPy** | Numerical Engine | [![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)](https://numpy.org) | Vectorized mathematical probability scoring |
| **Google Gemini API** | Large Language Model | [![Google Gemini](https://img.shields.io/badge/Google_Gemini_SDK-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev) | Multi-turn SecOps Copilot & deep architectural analysis |
| **Adaptive WAF Mutator** | Heuristic Security | [![AI Mutator](https://img.shields.io/badge/Adaptive_WAF_Mutator-A855F7?style=for-the-badge&logo=openai&logoColor=white)](#) | Filter evasion synthesis for DAST testing |

---

## ⚡ Comprehensive Module Breakdown

### 1. Security Operations Command Dashboard
- **Security Score Calculation:** Computes a composite health score (0–100) factoring in CVSS weights:
  $$\text{Score} = \max(0, 100 - [25 \times N_{\text{crit}} + 15 \times N_{\text{high}} + 7 \times N_{\text{med}} + 2 \times N_{\text{low}}])$$
- **Telemetry Distribution:** Visualizes real-time distribution across Critical, High, Medium, and Low vulnerabilities.
- **Historical Posture Trajectory:** Area chart tracking resilience improvements over time.

### 2. Target Scope & SSRF Guardrail Management
- **Explicit Scope Allowlisting:** Enforces manual verification of domain ownership prior to probe initiation.
- **SSRF Protective Filter:** Resolves domain DNS and inspects destination IPs against private, loopback, and cloud metadata ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.169.254`). Rejects any internal pivoting attempts.

### 3. DNS Reconnaissance & Fingerprinting Engine
- **DNS Telemetry:** Resolves and validates `A`, `AAAA`, `MX`, `NS`, `TXT`, `CNAME`, and `SOA` records.
- **Subdomain Discovery:** Asynchronously enumerates subdomains (`api`, `dev`, `staging`, `admin`, `vpn`, `mail`, `auth`, `portal`) using non-intrusive DNS queries.
- **Stack Fingerprinting:** Identifies web servers (Nginx, Apache, Cloudflare, Caddy), frameworks (Express, React, Django), and cookie parameters (`HttpOnly`, `SameSite`, `Secure`).

### 4. Controlled TCP Port Scanner
- Non-destructive TCP connect handshakes on common service ports (`21`, `22`, `25`, `53`, `80`, `110`, `143`, `443`, `465`, `587`, `993`, `995`, `3000`, `3306`, `5432`, `6379`, `8000`, `8080`, `8443`).
- Service banner grabbing to identify running daemon versions.

### 5. SSL / TLS Security Analyzer
- **Certificate Chain Audit:** Validates Common Name (CN), Subject Alternative Names (SANs), Issuer authority, and expiration countdown.
- **Protocol Verification:** Tests TLS 1.2 and TLS 1.3 handshakes while flagging insecure legacy protocols (SSLv3, TLS 1.0, TLS 1.1).
- **Cipher Suite Evaluation:** Detects deprecated CBC, RC4, 3DES ciphers and validates Perfect Forward Secrecy (PFS) support.
- **Security Grade Assignment:** Rates configuration from `A+` down to `F`.

### 6. HTTP Defense-in-Depth Header Analyzer
- Audits modern defensive response headers:
  - `Content-Security-Policy` (CSP)
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options` (Clickjacking prevention)
  - `X-Content-Type-Options` (MIME-sniffing prevention)
  - `Referrer-Policy` & `Permissions-Policy`
- Flags information leakage headers (`Server`, `X-Powered-By`, `X-AspNet-Version`).

### 7. Safe Non-Destructive DAST Prober
- **Safe SQLi Verification:** Employs single-quote syntax boundary balancing (`'`, `''`, `"`) to identify unhandled SQL error signatures (MySQL, PostgreSQL, MSSQL, Oracle, SQLite) without modifying rows or injecting payload logic.
- **Canary Reflected XSS Probing:** Injects harmless, unique UUID canary tokens (`vulnscan_<uuid><test_xss>`) to detect reflected DOM contexts without executing malicious JavaScript.

### 8. CVE Intelligence Hub
- Automatically cross-references fingerprinted software banners (e.g., `Apache/2.4.49`, `OpenSSL/1.0.2`, `PHP/7.4.3`) against an indexed CVE database with official CVSS scores and Mitre/NVD references.

---

## 🧠 AI & Machine Learning Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VULNSCAN AI/ML INTELLIGENCE ENGINE                   │
├────────────────────────────┬───────────────────────────────────────────┤
│ 1. ML EPSS Threat Scoring  │ Calibrated logistic regression model      │
│                            │ calculating in-the-wild exploit velocity  │
├────────────────────────────┼───────────────────────────────────────────┤
│ 2. AI Code SAST Auditor    │ Static source code analyzer detecting     │
│                            │ CWE-89, CWE-78, CWE-798, CWE-79 flaws     │
├────────────────────────────┼───────────────────────────────────────────┤
│ 3. Multi-Framework Fixes   │ Production patches for FastAPI, Node.js,  │
│                            │ Django, and Nginx configurations          │
├────────────────────────────┼───────────────────────────────────────────┤
│ 4. Adaptive WAF Mutator    │ Heuristic filter-bypass payload synthesis │
│ 5. Hybrid Fallback Core    │ 100% offline Scikit-Learn local core +    │
│                            │ optional Google Gemini 2.5 Flash SDK      │
└────────────────────────────┴───────────────────────────────────────────┘
```

### Mathematical EPSS Model
The Exploit Prediction Scoring System (EPSS) estimates the empirical probability $P(\text{Exploit})$ that a vulnerability will be actively exploited in the wild within 30 days:

$$z = w_0 + w_1 \cdot \text{CVSS}_{\text{norm}} + w_2 \cdot C_{\text{category}} + w_3 \cdot V_{\text{remote}} + w_4 \cdot E_{\text{PoC}} + w_5 \cdot A_{\text{auth}}$$

$$P(\text{Exploit}) = \frac{1}{1 + e^{-z}}$$

Where:
- $\text{CVSS}_{\text{norm}} \in [0.0, 1.0]$: Normalized base severity score.
- $C_{\text{category}}$: Empirical category risk multiplier (e.g., $1.60$ for RCE, $1.35$ for SQLi, $1.15$ for XSS).
- $E_{\text{PoC}}$: Weight scalar for weaponized publicly accessible exploits.
- $V_{\text{remote}}, A_{\text{auth}}$: Attack surface ingress and credential requirement factors.

---

## 🎯 OWASP Top 10 Coverage Matrix

| OWASP Top 10 Category | VulnScan Detection Capability | Primary Module |
| :--- | :--- | :--- |
| **A01:2021 — Broken Access Control** | SSRF protection, administrative surface exposure, path traversal checking | Target Manager & Recon Engine |
| **A02:2021 — Cryptographic Failures** | Weak TLS ciphers, expired/self-signed certs, missing HSTS, plaintext protocols | SSL/TLS Analyzer & Header Engine |
| **A03:2021 — Injection** | Safe SQL injection boundary detection, OS command injection SAST, reflected XSS | DAST Prober & AI Code Auditor |
| **A05:2021 — Security Misconfiguration** | Missing CSP/X-Frame-Options headers, exposed server banners, default open ports | Header Analyzer & Port Scanner |
| **A06:2021 — Vulnerable & Outdated Components** | Fingerprint correlation with known CVE databases & EPSS threat velocity | CVE Intelligence Hub & AI Engine |

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Health check, engine version, and Safe Mode status |
| `GET` | `/api/v1/dashboard/stats` | Aggregated security posture metrics and score trajectory |
| `GET` | `/api/v1/targets` | List all authorized registered target scopes |
| `POST` | `/api/v1/targets` | Add target domain with SSRF validation and ownership check |
| `GET` | `/api/v1/scans` | List scan execution history and telemetry logs |
| `POST` | `/api/v1/scans` | Trigger asynchronous assessment pipeline (`FULL`, `RECON`, `PORT`, `VULN`) |
| `GET` | `/api/v1/findings` | Retrieve discovered vulnerabilities with filter by severity & category |
| `POST` | `/api/v1/recon/inspect` | On-demand DNS and technology fingerprint scan |
| `POST` | `/api/v1/ports/scan` | On-demand concurrent TCP port scan |
| `POST` | `/api/v1/ssl/analyze` | On-demand X.509 certificate and TLS handshake inspection |
| `POST` | `/api/v1/headers/analyze` | On-demand HTTP security header audit |
| `POST` | `/api/v1/vulnerabilities/test-sqli` | Non-destructive safe SQL injection canary test |
| `POST` | `/api/v1/vulnerabilities/test-xss` | Non-destructive reflected XSS canary probe |
| `POST` | `/api/v1/cve/check-banner` | Correlate software version string against CVE database |
| `POST` | `/api/v1/ai/remediate` | Synthesize multi-language code patch & ML EPSS prediction |
| `POST` | `/api/v1/ai/audit-code` | SAST code scanner detecting vulnerabilities in source snippets |
| `POST` | `/api/v1/ai/copilot-chat` | Interactive AI SecOps analyst query endpoint |
| `POST` | `/api/v1/ai/executive-summary` | Synthesize CISO-grade threat assessment narrative |
| `GET` | `/api/v1/reports/generate/{scan_id}` | Compile and download executive PDF report |
| `POST` | `/api/v1/heartbeat` | Client heartbeat watchdog for automated background lifecycle |
| `POST` | `/api/v1/shutdown` | Gracefully terminate server and free network sockets |

---

## 📂 Project Architecture & Directory Layout

```
VulnScan/
├── .gitignore                     # Git tracking exclusions (node_modules, pycache, dbs)
├── README.md                      # Comprehensive technical documentation & screenshots
├── docker-compose.yml             # Multi-container orchestration definition
├── launcher.py                    # Process manager: launches backend/frontend with NO_WINDOW
├── start_server.bat               # One-click silent Windows launcher
├── stop_server.bat                # Clean process terminator (frees ports 8000 & 3000)
├── docs/
│   └── screenshots/               # High-resolution real UI screenshots
├── backend/
│   ├── Dockerfile                 # Backend containerization spec
│   ├── requirements.txt           # Python dependency manifest (FastAPI, Scikit-Learn, etc.)
│   ├── app/
│   │   ├── config.py              # Central engine configuration & environment settings
│   │   ├── database.py            # SQLAlchemy database engine & session factory
│   │   ├── main.py                # FastAPI application entrypoint & watchdog handlers
│   │   ├── api/                   # Modular REST API endpoints
│   │   │   ├── ai.py              # AI Copilot, EPSS predictor, SAST auditor
│   │   │   ├── cve.py             # CVE intelligence hub
│   │   │   ├── dashboard.py       # Posture metrics & score telemetry
│   │   │   ├── findings.py        # Vulnerability inventory & filters
│   │   │   ├── headers.py         # HTTP security header analyzer
│   │   │   ├── ports.py           # Controlled TCP port scanner
│   │   │   ├── recon.py           # DNS reconnaissance & stack fingerprinting
│   │   │   ├── reports.py         # PDF compilation & download router
│   │   │   ├── scans.py           # Pipeline orchestrator & cancel router
│   │   │   ├── settings.py        # Engine guardrails & audit trails
│   │   │   ├── ssl.py             # TLS handshake & cipher inspector
│   │   │   ├── targets.py         # Scope management & SSRF validation
│   │   │   └── vulnerabilities.py # Safe DAST SQLi/XSS live testbed
│   │   ├── models/                # Database models (Target, Scan, Finding, AuditLog)
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   └── services/              # Core security auditing services & AI engine
│   └── tests/                     # Automated pytest test suites (100% pass rate)
└── frontend/
    ├── Dockerfile                 # Frontend containerization spec
    ├── package.json               # Node.js dependencies & scripts
    ├── tailwind.config.js         # Theme styling & color palette configuration
    ├── vite.config.ts             # Vite bundler & reverse proxy configuration
    └── src/
        ├── App.tsx                # Master UI layout & watchdog beacon
        ├── index.css              # Cyber glassmorphism styling
        ├── api/                   # Typed API client
        ├── components/            # Reusable UI widgets, badges, dials & modals
        └── pages/                 # Full dashboard workspaces (Dashboard, AI Copilot, etc.)
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Python 3.10+** (Python 3.11 or 3.14 recommended)
- **Node.js 18+** & **npm**

### Option 1: One-Click Silent Launch (Windows)
Double-click `start_server.bat` in the project root:
```cmd
start_server.bat
```
- **Zero Open CMD Windows:** Launches backend and frontend silently in the background with `CREATE_NO_WINDOW`.
- **Auto-Shutdown on Browser Close:** Closing your browser window triggers an automated heartbeat watchdog (`navigator.sendBeacon('/api/v1/shutdown')`) that cleanly frees ports `8000` and `3000`.
- *(Manual stop: Double-click `stop_server.bat` anytime)*

### Option 2: Manual Terminal Execution

#### 1. Backend Service
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000`
- Swagger Interactive Docs: `http://127.0.0.1:8000/api/docs`

#### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 🧪 Testing & Verification

### Run Backend Unit Tests
VulnScan includes an automated test suite verifying scanner guardrails, SSRF validation, and AI/ML algorithms:
```bash
cd backend
python -m pytest tests/
```
```text
tests\test_ai_engine.py .....   [ 62%]
tests\test_scanner.py ...       [100%]
============================== 8 passed in 0.85s ==============================
```

### Run Frontend Production Build
```bash
cd frontend
npm run build
```
```text
✓ 2551 modules transformed.
dist/index.html                   1.17 kB │ gzip:   0.68 kB
dist/assets/index-DZNhFos5.css   46.80 kB │ gzip:   8.39 kB
dist/assets/index-XxHvu6iK.js   847.45 kB │ gzip: 232.68 kB
✓ built in 13.84s
```

---

## ⚖️ Legal & Ethical Use Disclaimer

> **IMPORTANT:** VulnScan is engineered strictly for authorized security auditing, defensive hardening, vulnerability remediation, and educational assessment of systems where the operator has explicit, documented authorization from the asset owner. Running security scans against third-party systems without prior written consent violates federal and international cybersecurity laws (including the US Computer Fraud and Abuse Act 18 U.S.C. § 1030). The developers assume no liability for misuse or damage resulting from the operation of this software.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

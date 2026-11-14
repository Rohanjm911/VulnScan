# Contributing to VulnScan

Thank you for your interest in contributing to **VulnScan**! We welcome bug reports, feature requests, code contributions, and security audits.

---

## 🛠️ Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Rohanjm911/VulnScan.git
cd VulnScan
```

### 2. Backend Setup (FastAPI & Python)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup (React & Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Running Tests & Quality Verification

Before submitting pull requests, ensure all automated tests pass:

### Backend Unit & Integration Tests
```bash
cd backend
python -m pytest tests/
```
All 14 tests must pass with 0 failures.

### Frontend Production Build & TypeScript Check
```bash
cd frontend
npm run build
```
Verify that `tsc && vite build` completes with 0 errors.

---

## 🎨 UI Guidelines

- Follow **Flat Dark Design** standards:
  - Solid matte surfaces (`#0b0f19` background, `#111827` / `#131722` cards).
  - Subtle borders (`#1e293b` / `#1f2937`).
  - Solid accent colors (`#3b82f6` blue for primary actions).
  - **Zero neon glows, zero synthwave gradients.**
  - High-contrast, readable typography suitable for enterprise SecOps.

---

## ⚖️ Code of Conduct & Ethics

Contributions must adhere to ethical cybersecurity standards. VulnScan is strictly intended for defensive engineering, authorized penetration testing, and compliance verification. Any PR introducing unconstrained offensive payloads or bypassing safety guardrails will be rejected.

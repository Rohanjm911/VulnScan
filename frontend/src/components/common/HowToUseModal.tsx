import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  ShieldCheck, 
  Play, 
  Bot, 
  Sliders, 
  Sparkles, 
  Keyboard, 
  ExternalLink,
  Target,
  Database,
  Lock,
  Layers,
  Code2,
  Cpu
} from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'modules' | 'aiml' | 'fx' | 'shortcuts'>('quickstart');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="bg-[#111827] border border-[#1e293b] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1e293b] bg-[#0d121f] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    VulnScan — Operator Field Guide & How-To
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60">
                    USER MANUAL
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Complete operational manual for automated vulnerability assessments, AI intelligence, and platform modules.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 px-4 pt-2 border-b border-[#1e293b] bg-[#0d121f] overflow-x-auto text-xs font-mono">
            {[
              { id: 'quickstart', label: '1. Quick Start', icon: Play },
              { id: 'modules', label: '2. Modular Scanners', icon: Sliders },
              { id: 'aiml', label: '3. AI & ML Copilot', icon: Bot },
              { id: 'fx', label: '4. Flat Minimal Design', icon: Sparkles },
              { id: 'shortcuts', label: '5. Shortcuts & Ops', icon: Keyboard },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'border-blue-500 text-blue-400 bg-blue-600/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Body */}
          <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans leading-relaxed flex-1">
            {/* Tab 1: Quick Start */}
            {activeTab === 'quickstart' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <h4 className="font-semibold text-white text-sm">Step 1: Verify Scope & Register Target</h4>
                  <p className="text-slate-400 text-xs">
                    Navigate to <strong>Target Manager</strong>. Enter the target hostname or domain (e.g., <code className="text-blue-300">juice-shop.herokuapp.com</code>). Check the <strong>"Target is Authorized for Security Auditing"</strong> checkbox and add your authorization ticket notes.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <h4 className="font-semibold text-white text-sm">Step 2: Launch Vulnerability Scan</h4>
                  <p className="text-slate-400 text-xs">
                    Click the <strong>"New Scan"</strong> button in the top right. Select your registered target, choose a profile (e.g. <strong>Full Assessment</strong> or <strong>Reconnaissance</strong>), and start the assessment.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <h4 className="font-semibold text-white text-sm">Step 3: Review Telemetry & Findings</h4>
                  <p className="text-slate-400 text-xs">
                    Inspect telemetry logs in <strong>Scan History</strong>. Explore findings in <strong>Vulnerability Assessment</strong> with technical evidence, CVSS metrics, and AI remediation patches.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Modular Scanners */}
            {activeTab === 'modules' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <span className="font-semibold text-white">🌐 Reconnaissance Engine</span>
                  <p className="text-slate-400 text-[11px]">Probes DNS records (A, MX, NS, TXT), discovers active subdomains, and fingerprints web servers and frameworks.</p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <span className="font-semibold text-white">☁️ Cloud & Subdomain Takeover</span>
                  <p className="text-slate-400 text-[11px]">Discovers dangling CNAME records for AWS S3, GitHub Pages, Heroku, and scans for public S3 and GCP storage buckets.</p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <span className="font-semibold text-white">🔌 TCP Port Scanner</span>
                  <p className="text-slate-400 text-[11px]">Safe, controlled asynchronous port scanning across standard web and administrative service ports.</p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <span className="font-semibold text-white">🔒 SSL/TLS Analyzer</span>
                  <p className="text-slate-400 text-[11px]">Verifies certificate chains, expiration dates, protocol versions (TLS 1.2, 1.3), and deprecated ciphers.</p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <span className="font-semibold text-white">📜 API Security & OpenAPI Auditor</span>
                  <p className="text-slate-400 text-[11px]">Static and runtime audit of OpenAPI specs for OWASP API Top 10 BOLA/IDOR, broken auth, and missing pagination.</p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <span className="font-semibold text-white">🔑 Secrets & Token Leaker</span>
                  <p className="text-slate-400 text-[11px]">Deep-crawls target web pages and external JavaScript script bundles for exposed API keys and cloud tokens.</p>
                </div>
              </div>
            )}

            {/* Tab 3: AI & ML Copilot */}
            {activeTab === 'aiml' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <span className="font-semibold text-white">🤖 AI Remediation & Code Patch Synthesizer</span>
                  <p className="text-slate-400 text-[11px]">Click "AI Fix & Patch" on any finding card to generate production patches (Python/FastAPI, Node.js, Nginx WAF) with 1-click clipboard copy.</p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <span className="font-semibold text-white">🔍 AI Static Code Auditor (SAST)</span>
                  <p className="text-slate-400 text-[11px]">Paste any raw source code in AI SecOps Copilot to detect CWE vulnerabilities, line numbers, and refactored secure snippets.</p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <span className="font-semibold text-white">📊 ML EPSS Exploitability Predictor</span>
                  <p className="text-slate-400 text-[11px]">Calibrated logistic regression model calculating in-the-wild exploit velocity (0-100%) and remediation SLA prioritization.</p>
                </div>
              </div>
            )}

            {/* Tab 4: Flat Minimal Design */}
            {activeTab === 'fx' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                  <span className="font-semibold text-white text-sm">Flat Minimal Theme — Zero Neon Glow</span>
                  <p className="text-slate-400 text-xs">
                    The platform enforces a clean, flat matte dark design. No glowing shadows, no neon gradients, and zero distracting animations, maximizing legibility and battery efficiency.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 5: Shortcuts & Ops */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#0d121f] border border-[#1e293b] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Open Command Palette (Quick Find)</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#1e293b] text-slate-300 border border-[#334155]">
                    Ctrl + K
                  </kbd>
                </div>
                <div className="p-3 rounded-lg bg-[#0d121f] border border-[#1e293b] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Close Modals / Overlays</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#1e293b] text-slate-300 border border-[#334155]">
                    Esc
                  </kbd>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1e293b] bg-[#0d121f] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>VulnScan v1.0.0 • Field Operations Manual</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

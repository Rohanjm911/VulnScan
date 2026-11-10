import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Crosshair, 
  Play, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Sliders, 
  Bot, 
  Keyboard, 
  Zap, 
  Radio, 
  Box, 
  Code 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'modules' | 'aiml' | 'fx' | 'shortcuts'>('quickstart');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#120B26] border border-purple-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#2E1E54] bg-[#160E32] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600/25 text-fuchsia-300 border border-purple-500/40 shadow-glow-synth">
                <HelpCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-heading text-white tracking-wide">
                    VulnScan — Operator Field Guide & How-To
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-fuchsia-300 border border-purple-800/60">
                    USER MANUAL
                  </span>
                </div>
                <p className="text-xs text-purple-300/70 font-sans mt-0.5">
                  Complete operational manual for automated vulnerability assessments, AI intelligence, and visual styles.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#201545] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#2E1E54] bg-[#0E071F] overflow-x-auto text-xs font-mono">
            {[
              { id: 'quickstart', label: '1. Quick Start', icon: Play },
              { id: 'modules', label: '2. Modular Scanners', icon: Sliders },
              { id: 'aiml', label: '3. AI & ML Copilot', icon: Bot },
              { id: 'fx', label: '4. Visual Themes & FX', icon: Sparkles },
              { id: 'shortcuts', label: '5. Shortcuts & Ops', icon: Keyboard },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'border-fuchsia-400 text-fuchsia-300 bg-purple-900/20'
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
          <div className="p-6 overflow-y-auto space-y-5 text-xs font-sans leading-relaxed flex-1">
            {/* Tab 1: Quick Start */}
            {activeTab === 'quickstart' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200">
                  <h4 className="font-bold text-sm text-white font-heading mb-1">
                    🚀 3-Step Assessment Workflow
                  </h4>
                  <p className="text-slate-300">
                    VulnScan is engineered for safe, non-destructive automated security posture auditing. Follow these 3 steps to run a full audit:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1 */}
                  <div className="p-4 rounded-xl bg-[#160E30] border border-[#2E1E54] space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-fuchsia-300 font-mono font-bold flex items-center justify-center border border-purple-500/40">
                      1
                    </div>
                    <h5 className="font-bold text-white text-xs uppercase font-heading">
                      Add Target Scope
                    </h5>
                    <p className="text-slate-400 text-[11px]">
                      Go to <strong>Targets</strong>, click <strong>"Add Target"</strong>, input your authorized domain or local testbed (e.g., OWASP Juice Shop or <code className="text-purple-300">http://127.0.0.1:3000</code>).
                    </p>
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>SSRF Guard active</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl bg-[#160E30] border border-[#2E1E54] space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-fuchsia-300 font-mono font-bold flex items-center justify-center border border-purple-500/40">
                      2
                    </div>
                    <h5 className="font-bold text-white text-xs uppercase font-heading">
                      Launch Scan
                    </h5>
                    <p className="text-slate-400 text-[11px]">
                      Click <strong>"New Scan"</strong> in the topbar or target row. Choose <strong>FULL</strong>, <strong>RECON</strong>, <strong>VULN</strong>, or <strong>PORT</strong>. Real-time telemetry logs pipeline progress.
                    </p>
                    <div className="text-[10px] font-mono text-purple-300 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>Parallel asynchronous execution</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-xl bg-[#160E30] border border-[#2E1E54] space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-fuchsia-300 font-mono font-bold flex items-center justify-center border border-purple-500/40">
                      3
                    </div>
                    <h5 className="font-bold text-white text-xs uppercase font-heading">
                      Review & AI Patch
                    </h5>
                    <p className="text-slate-400 text-[11px]">
                      Review score in <strong>Dashboard</strong>. In <strong>Vulnerabilities</strong>, click <strong>"AI Fix & Patch"</strong> for code fixes, or go to <strong>Reports</strong> to compile and download an executive PDF audit.
                    </p>
                    <div className="text-[10px] font-mono text-fuchsia-300 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>One-click PDF Export</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#140D2A] border border-[#2E1E54] flex items-center justify-between">
                  <div className="text-[11px] text-slate-300">
                    <strong className="text-white">Demonstration Lab Ready:</strong> The OWASP Juice Shop target is pre-loaded in the scope table for safe local DAST verification.
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('targets');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-mono text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>Go to Targets</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Modular Scanners */}
            {activeTab === 'modules' && (
              <div className="space-y-3">
                <p className="text-slate-300">
                  VulnScan includes 6 dedicated security auditing engines that can be run on-demand or orchestrated together:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#150E2E] border border-[#2E1E54] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>Reconnaissance Engine</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Resolves DNS A/AAAA records, MX mail hosts, common subdomain enumeration, and fingerprints technology stacks (Nginx, React, PHP, Express).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#150E2E] border border-[#2E1E54] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
                      <span>Port Scanner (TCP)</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Conducts controlled TCP handshakes on essential web and database ports (21, 22, 80, 443, 3000, 8000, 8080) with service identification.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#150E2E] border border-[#2E1E54] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>SSL / TLS Security Analyzer</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Extracts X.509 certificate chains, validates SANs, verifies expiration days remaining, and flags weak CBC/RC4 cipher suites.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#150E2E] border border-[#2E1E54] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>HTTP Header Defense-in-Depth</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Audits modern browser defense headers including Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), and X-Frame-Options.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#150E2E] border border-[#2E1E54] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span>Safe DAST Vulnerability Engine</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Injects single quote syntax checks and harmless random canary tokens (<code className="text-purple-300">vulnscan_uuid</code>) to safely confirm SQLi and reflected XSS without database alteration.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#150E2E] border border-[#2E1E54] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>CVE Intelligence Hub</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Correlates captured server HTTP response headers (e.g., Apache/2.4.49, OpenSSL/1.0.2) against an indexed CVE vulnerability database.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: AI & ML Copilot */}
            {activeTab === 'aiml' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#170E30] border border-purple-500/30 text-purple-200">
                  <h4 className="font-bold text-sm text-white font-heading flex items-center gap-2 mb-1">
                    <Bot className="w-4 h-4 text-fuchsia-400" />
                    <span>How to Use the AI & Machine Learning Tools</span>
                  </h4>
                  <p className="text-slate-300 text-xs">
                    VulnScan includes hybrid local ML (Scikit-Learn/NumPy) + optional Google GenAI intelligence across multiple features:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#140D2A] border border-[#2E1E54] space-y-1">
                    <strong className="text-white block font-mono text-xs">
                      🤖 AI Remediation & Patch Synthesizer (In Vulnerability Assessment):
                    </strong>
                    <p className="text-slate-300 text-[11px]">
                      Click the purple <strong>"AI Fix & Patch"</strong> button on any finding card. It will generate multi-framework production patches (Python/FastAPI, Node.js/Express, Nginx WAF) with 1-click clipboard copy.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#140D2A] border border-[#2E1E54] space-y-1">
                    <strong className="text-white block font-mono text-xs">
                      🔍 AI Static Code Auditor (SAST) (In AI SecOps Copilot):
                    </strong>
                    <p className="text-slate-300 text-[11px]">
                      Open the <strong>AI SecOps Copilot</strong> tab and switch to <strong>"AI Code Auditor"</strong>. Paste any raw source code and click "Scan Code with AI" to identify CWE flaws with line numbers and refactored code.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#140D2A] border border-[#2E1E54] space-y-1">
                    <strong className="text-white block font-mono text-xs">
                      📊 ML EPSS Exploitability Predictor (In AI SecOps Copilot):
                    </strong>
                    <p className="text-slate-300 text-[11px]">
                      Switch to <strong>"ML EPSS Predictor"</strong>. Adjust CVSS, attack surface, and weaponized PoC parameters to calculate real-world exploit probability (0-100%) and SLA deadlines.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#140D2A] border border-[#2E1E54] space-y-1">
                    <strong className="text-white block font-mono text-xs">
                      ⚡ Adaptive WAF Payload Mutator (In AI SecOps Copilot):
                    </strong>
                    <p className="text-slate-300 text-[11px]">
                      Generates inline-comment, hex-encoded, and HTML5 autofocus payloads designed to test WAF evasion behavior safely.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Visual Themes & FX */}
            {activeTab === 'fx' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#160E30] border border-purple-500/40 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-100 text-sm font-heading">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Stealth Minimal — Engineered for Professional AppSec</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    VulnScan is locked to the <strong>Stealth Minimal</strong> design aesthetic: clean, static, high-contrast dark cybersecurity layout without distracting animations or continuous GPU loops.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#150E2E] border border-[#2E1E54] space-y-1">
                    <strong className="text-white block font-mono text-xs">⚡ Zero Distraction:</strong>
                    <p className="text-slate-400 text-[11px]">
                      No looping laser beams or continuous canvas draws, freeing up your system resources for high-speed automated security network probes.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#150E2E] border border-[#2E1E54] space-y-1">
                    <strong className="text-white block font-mono text-xs">🎯 Pure Telemetry Legibility:</strong>
                    <p className="text-slate-400 text-[11px]">
                      High-visibility Space Grotesk and JetBrains Mono typography for instantaneous recognition of CVSS vulnerabilities, TLS cipher states, and port maps.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Shortcuts & Ops */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="font-bold text-xs uppercase font-mono text-purple-300 block">
                    Keyboard Shortcuts:
                  </span>
                  <div className="p-3 rounded-xl bg-[#140D2A] border border-[#2E1E54] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Open Global Command Palette (Quick Find)</span>
                    <kbd className="px-2 py-1 rounded bg-[#201545] text-purple-300 border border-purple-500/40 font-bold">
                      Ctrl + K
                    </kbd>
                  </div>
                  <div className="p-3 rounded-xl bg-[#140D2A] border border-[#2E1E54] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Close Modals / Overlays</span>
                    <kbd className="px-2 py-1 rounded bg-[#201545] text-purple-300 border border-purple-500/40 font-bold">
                      Esc
                    </kbd>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#2E1E54]">
                  <span className="font-bold text-xs uppercase font-mono text-emerald-400 block">
                    Zero-Overhead Silent Lifecycle:
                  </span>
                  <p className="text-slate-300 text-xs">
                    * <strong>Silent Launch:</strong> Running <code className="text-purple-300">start_server.bat</code> launches the server in the background without leaving any open terminal or CMD windows.
                  </p>
                  <p className="text-slate-300 text-xs">
                    * <strong>Auto-Shutdown Watchdog:</strong> When you close the browser tab or window, VulnScan transmits a heartbeat termination beacon (<code className="text-purple-300">sendBeacon /api/v1/shutdown</code>) which automatically terminates background processes and frees ports 8000 & 3000!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#2E1E54] bg-[#140D2B] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>VulnScan v1.0.0 • Field Operations Manual</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold transition-all shadow-glow-synth"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


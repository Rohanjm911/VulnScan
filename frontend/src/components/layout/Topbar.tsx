import React, { useState } from 'react';
import { 
  Play, 
  RefreshCw, 
  Shield, 
  Bell, 
  Search, 
  Menu, 
  User, 
  X, 
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HowToUseModal } from '../common/HowToUseModal';

interface TopbarProps {
  currentTab: string;
  onOpenNewScan: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onOpenSearch: () => void;
  onToggleMobileMenu: () => void;
  onNavigate?: (tab: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onOpenNewScan,
  onRefresh,
  isRefreshing = false,
  onOpenSearch,
  onToggleMobileMenu,
  onNavigate,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);

  const notifications = [
    { id: 1, title: 'Engine Policy Enforced', time: 'Active', type: 'info', text: 'SSRF guard & safe socket limits active.' },
    { id: 2, title: 'Live Scanning Engine', time: 'Ready', type: 'success', text: 'Real-time DAST, port probing, and SSL handshakes ready.' },
    { id: 3, title: 'Threat Intelligence Core', time: 'Active', type: 'info', text: 'CVE database & ML EPSS model online.' },
  ];

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Security Operations Dashboard', subtitle: 'Automated Web Vulnerability Intelligence & Posture Metrics' },
    targets: { title: 'Target Management & Scope', subtitle: 'Verified Ownership, SSRF Guardrails & Scope Allowlisting' },
    recon: { title: 'Reconnaissance Engine', subtitle: 'DNS Analysis, Subdomain Discovery & Web Stack Fingerprinting' },
    'cloud-recon': { title: 'Cloud Recon & Subdomain Takeover', subtitle: 'Dangling CNAME Takeovers & Public AWS/GCP Bucket Inspection' },
    ports: { title: 'Network Port Scanner', subtitle: 'Controlled TCP Port & Service Identification' },
    ssl: { title: 'SSL / TLS Security Analyzer', subtitle: 'Certificate Chain, Cipher Suites & Protocol Verification' },
    headers: { title: 'HTTP Defense-in-Depth Headers', subtitle: 'CSP, HSTS, X-Frame-Options & Modern Browser Policies' },
    'api-sec': { title: 'API Security & OpenAPI Auditor', subtitle: 'OWASP API Security Top 10 BOLA/IDOR, Broken Auth & Spec Auditing' },
    secrets: { title: 'Client Secrets & Leaked API Key Detector', subtitle: 'Static & Dynamic Asset Bundle Token Decompilation' },
    vulns: { title: 'Vulnerability Assessment', subtitle: 'Safe, Non-Destructive SQL Injection & Reflected XSS Canaries' },
    compliance: { title: 'Compliance Auditor & Benchmark Matrix', subtitle: 'SOC 2 Type II, ISO/IEC 27001, PCI-DSS v4.0 & HIPAA Readiness' },
    schedules: { title: 'Scheduled Automated Scans & Webhooks', subtitle: 'Continuous Background Probing & Discord/Slack Alert Integration' },
    ai: { title: 'AI / ML Cybersecurity Intelligence Center', subtitle: 'Machine Learning Exploit Prediction, Code SAST, Adaptive WAF Mutator & SecOps Copilot' },
    cve: { title: 'CVE Intelligence Hub', subtitle: 'Fingerprint-Correlated CVE Vulnerability Database' },
    history: { title: 'Scan History & Execution Logs', subtitle: 'Real-time Pipeline Telemetry & Audit Trails' },
    reports: { title: 'Executive & Technical Reports', subtitle: 'Downloadable PDF Audits & Compliance Documentation' },
    settings: { title: 'System Configuration & Audit Logs', subtitle: 'Scanner Engine Guardrails, Timeouts & Operational Logs' },
  };

  const currentInfo = tabTitles[currentTab] || { title: 'VulnScan', subtitle: 'Security Intelligence' };

  return (
    <header className="h-16 border-b border-[#1e293b] bg-[#0d121f] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Titles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] lg:hidden"
          title="Toggle Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
            {currentInfo.title}
          </h1>
          <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Bar (opens Command Palette) */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-600 transition-colors text-xs font-mono"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Quick Find</span>
          <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[9px] bg-[#1e293b] text-slate-300 border border-[#334155] rounded font-mono">
            Ctrl+K
          </kbd>
        </button>

        {/* Scope Shield Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>SCOPE LOCKED</span>
        </div>

        {/* How To Use Interactive Guide Toggle */}
        <button
          onClick={() => setShowHowToUse(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1e293b] hover:bg-[#1e293b] hover:border-slate-600 text-slate-200 hover:text-white transition-colors text-xs font-medium"
          title="Open How to Use & Operator Field Guide"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">How to Use</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-[#111827] border border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-[#111827] border border-[#1e293b] rounded-lg shadow-xl p-4 text-xs z-50 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                  <span className="font-bold text-white uppercase tracking-wider">
                    SecOps Notifications
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded bg-[#1e293b] border border-[#334155] space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{n.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className={`p-2 rounded-lg bg-[#111827] border border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-600 transition-colors ${
            isRefreshing ? 'animate-spin text-blue-400' : ''
          }`}
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* User / SecOps Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#1e293b]">
          <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden md:block">
            <span className="block text-xs font-medium text-slate-200 leading-tight">SecOps Admin</span>
            <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
          </div>
        </div>

        {/* Flat New Scan Action Button */}
        <button
          onClick={onOpenNewScan}
          className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs uppercase tracking-wider transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">New Scan</span>
        </button>
      </div>

      {/* Global How To Use Modal */}
      <HowToUseModal
        isOpen={showHowToUse}
        onClose={() => setShowHowToUse(false)}
        onNavigate={onNavigate}
      />
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  LayoutDashboard, 
  Crosshair, 
  Globe2, 
  Network, 
  Lock, 
  FileCode, 
  Bug, 
  Database, 
  History, 
  FileText, 
  Settings, 
  ArrowRight, 
  Command,
  Bot,
  Cloud,
  FileJson,
  KeyRound,
  Award,
  CalendarClock
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  const actions = [
    { id: 'dashboard', title: 'Security Operations Dashboard', category: 'Overview', icon: LayoutDashboard },
    { id: 'targets', title: 'Target Management & Scope Allowance', category: 'Assets', icon: Crosshair },
    { id: 'recon', title: 'Reconnaissance & DNS Fingerprinting', category: 'Engines', icon: Globe2 },
    { id: 'cloud-recon', title: 'Cloud Recon & Subdomain Takeover', category: 'Engines', icon: Cloud },
    { id: 'ports', title: 'TCP Port Scanner & Service Discovery', category: 'Engines', icon: Network },
    { id: 'ssl', title: 'SSL / TLS Certificate & Cipher Audit', category: 'Engines', icon: Lock },
    { id: 'headers', title: 'HTTP Defense-in-Depth Headers', category: 'Engines', icon: FileCode },
    { id: 'api-sec', title: 'API Security & OpenAPI Auditor', category: 'Assessment', icon: FileJson },
    { id: 'secrets', title: 'Client Secrets & Leaked API Keys', category: 'Assessment', icon: KeyRound },
    { id: 'vulns', title: 'Vulnerability Assessment (SQLi & XSS)', category: 'Assessment', icon: Bug },
    { id: 'compliance', title: 'Compliance Matrix (SOC2, ISO27001, PCI)', category: 'Compliance', icon: Award },
    { id: 'schedules', title: 'Scheduled Scans & Webhook Alerts', category: 'Operations', icon: CalendarClock },
    { id: 'ai', title: 'AI / ML SecOps Copilot & Code SAST', category: 'Intelligence', icon: Bot },
    { id: 'cve', title: 'CVE Intelligence Hub & Database', category: 'Intel', icon: Database },
    { id: 'history', title: 'Scan History & Execution Telemetry', category: 'Operations', icon: History },
    { id: 'reports', title: 'Executive & Technical PDF Reports', category: 'Documentation', icon: FileText },
    { id: 'settings', title: 'System Configuration & Audit Logs', category: 'Settings', icon: Settings },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl bg-[#111827] border border-[#1e293b] rounded-lg shadow-2xl overflow-hidden"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-[#1e293b] bg-[#0d121f]">
            <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search security modules or commands (e.g. 'recon', 'cve', 'ssl')..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-[#1e293b] border border-[#334155] rounded">
              ESC
            </kbd>
          </div>

          {/* List Results */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                No matching security module or action found.
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#1e293b] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-[#0d121f] text-blue-400 border border-[#1e293b] group-hover:border-[#334155] transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                          {item.title}
                        </p>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-4 py-2 bg-[#0d121f] border-t border-[#1e293b] text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Navigate: ↑ ↓</span>
            <span>Select: ↵</span>
            <span>SecOps Command Center</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

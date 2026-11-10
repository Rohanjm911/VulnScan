import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  X,
  Bot
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const isExpanded = !collapsed || isMobileOpen;

  const navItems = [
    { id: 'dashboard', label: 'Security Dashboard', icon: LayoutDashboard },
    { id: 'targets', label: 'Target Manager', icon: Crosshair },
    { id: 'recon', label: 'Reconnaissance', icon: Globe2 },
    { id: 'ports', label: 'Port Scanner', icon: Network },
    { id: 'ssl', label: 'SSL/TLS Analyzer', icon: Lock },
    { id: 'headers', label: 'Header Analyzer', icon: FileCode },
    { id: 'vulns', label: 'Vulnerability Assessment', icon: Bug },
    { id: 'ai', label: 'AI SecOps Copilot', icon: Bot },
    { id: 'cve', label: 'CVE Intelligence', icon: Database },
    { id: 'history', label: 'Scan History & Logs', icon: History },
    { id: 'reports', label: 'Reporting & PDF', icon: FileText },
    { id: 'settings', label: 'Settings & Audit', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B0814] border-r border-[#2E1E54]">
      {/* Brand Header */}
      <div className={`h-16 flex items-center border-b border-[#2E1E54]/80 px-4 ${
        isExpanded ? 'justify-between' : 'justify-center'
      }`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative p-2 rounded-xl bg-gradient-to-tr from-purple-500/25 to-fuchsia-500/25 border border-purple-500/50 shadow-glow-synth flex-shrink-0 cursor-pointer"
            onClick={() => !isExpanded && setCollapsed(false)}
            title="Expand Sidebar"
          >
            <ShieldCheck className="w-5 h-5 text-purple-300" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
          </div>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="truncate"
            >
              <span className="text-base font-bold font-heading tracking-wider bg-gradient-to-r from-white via-purple-200 to-fuchsia-400 bg-clip-text text-transparent">
                VULNSCAN
              </span>
              <p className="text-[10px] font-mono text-purple-400/90 uppercase tracking-widest -mt-0.5">
                AppSec Intel
              </p>
            </motion.div>
          )}
        </div>

        {/* Mobile Close Button or Desktop Collapse Toggle */}
        {isMobileOpen ? (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        ) : isExpanded ? (
          <button
            onClick={() => setCollapsed(true)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1D1438] transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Navigation Links */}
      <div className={`flex-1 overflow-y-auto py-4 space-y-2 ${isExpanded ? 'px-3' : 'px-2'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (!isExpanded) {
            // Collapsed Mode: Perfectly centered, enlarged icons with sleek floating tooltips
            return (
              <div key={item.id} className="relative group flex justify-center">
                <button
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative ${
                    isActive
                      ? 'bg-gradient-to-tr from-purple-500/25 via-fuchsia-500/20 to-indigo-500/20 text-fuchsia-300 border border-purple-500/60 shadow-glow-synth'
                      : 'text-slate-400 hover:text-purple-200 hover:bg-[#18112E] border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-fuchsia-400' : 'text-slate-400 group-hover:text-purple-300'
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-l bg-fuchsia-400 shadow-[0_0_8px_#E879F9]" />
                  )}
                </button>

                {/* Floating Modern Tooltip on Hover */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 pl-2">
                  <div className="px-3 py-1.5 rounded-lg bg-[#160E2A] border border-purple-500/40 text-purple-200 text-xs font-mono whitespace-nowrap shadow-2xl flex items-center gap-1.5">
                    <span>{item.label}</span>
                  </div>
                </div>
              </div>
            );
          }

          // Expanded Mode: Full width row with text and active pill
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500/20 via-fuchsia-500/15 to-transparent text-purple-100 border border-purple-500/50 shadow-glow-synth font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#18112E] border border-transparent'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-fuchsia-400' : 'text-slate-400 group-hover:text-purple-300'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_#E879F9]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Status Guard */}
      {isExpanded ? (
        <div className="p-3 m-3 rounded-xl bg-[#140E29] border border-[#2E1E54] text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>SSRF GUARD:</span>
            <span className="text-emerald-400 font-semibold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>SAFE MODE:</span>
            <span className="text-purple-400 font-semibold">ENFORCED</span>
          </div>
          <div className="pt-1 border-t border-[#2E1E54] text-[9px] text-slate-500 flex items-center gap-1">
            <Radio className="w-3 h-3 text-fuchsia-500 animate-pulse" />
            <span>Synthwave Scope Guard</span>
          </div>
        </div>
      ) : (
        <div className="p-3 mb-3 flex flex-col items-center gap-2">
          <button
            onClick={() => setCollapsed(false)}
            className="w-10 h-10 rounded-xl bg-[#140E29] border border-[#2E1E54] flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/40 transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4 text-purple-400" />
          </button>
          <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse" title="Security Guards Enforced" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 h-full z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

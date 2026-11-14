import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../common/Logo';
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
  Bot,
  Cloud,
  FileJson,
  KeyRound,
  Award,
  CalendarClock
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
    { id: 'cloud-recon', label: 'Cloud & Subdomain Takeover', icon: Cloud },
    { id: 'ports', label: 'Port Scanner', icon: Network },
    { id: 'ssl', label: 'SSL/TLS Analyzer', icon: Lock },
    { id: 'headers', label: 'Header Analyzer', icon: FileCode },
    { id: 'api-sec', label: 'API & OpenAPI Auditor', icon: FileJson },
    { id: 'secrets', label: 'Secrets & Token Leaks', icon: KeyRound },
    { id: 'vulns', label: 'Vulnerability Assessment', icon: Bug },
    { id: 'compliance', label: 'Compliance & Benchmarks', icon: Award },
    { id: 'schedules', label: 'Schedules & Webhooks', icon: CalendarClock },
    { id: 'ai', label: 'AI SecOps Copilot', icon: Bot },
    { id: 'cve', label: 'CVE Intelligence', icon: Database },
    { id: 'history', label: 'Scan History & Logs', icon: History },
    { id: 'reports', label: 'Reporting & PDF', icon: FileText },
    { id: 'settings', label: 'Settings & Audit', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d121f] border-r border-[#1e293b]">
      {/* Flat Brand Header */}
      <div className={`h-16 flex items-center border-b border-[#1e293b] px-4 ${
        isExpanded ? 'justify-between' : 'justify-center'
      }`}>
        <div 
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
          onClick={() => !isExpanded && setCollapsed(false)}
          title={!isExpanded ? "Expand Sidebar" : undefined}
        >
          <div className="flex-shrink-0">
            <Logo variant="sentinel" size={26} />
          </div>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="truncate"
            >
              <span className="text-base font-bold tracking-wide text-white">
                VULN<span className="text-blue-500">SCAN</span>
              </span>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                SecOps Platform
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
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Flat Navigation Links */}
      <div className={`flex-1 overflow-y-auto py-3 space-y-1 ${isExpanded ? 'px-3' : 'px-2'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (!isExpanded) {
            // Collapsed Mode: Centered flat icon with simple tooltip
            return (
              <div key={item.id} className="relative group flex justify-center">
                <button
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-[#1e293b]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>

                {/* Flat Tooltip on Hover */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 pl-2">
                  <div className="px-2.5 py-1 rounded bg-[#1e293b] border border-[#334155] text-slate-200 text-xs font-medium whitespace-nowrap shadow-md">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          }

          // Expanded Mode: Clean flat row with smooth gliding pill transition
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setIsMobileOpen(false);
              }}
              className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-blue-600 rounded-lg -z-0"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Icon className={`relative z-10 w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="relative z-10 truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Flat Footer Status */}
      {isExpanded ? (
        <div className="p-3 m-3 rounded-lg bg-[#111827] border border-[#1e293b] text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>SSRF GUARD:</span>
            <span className="text-emerald-400 font-medium">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>SAFE MODE:</span>
            <span className="text-blue-400 font-medium">ENFORCED</span>
          </div>
          <div className="pt-1 border-t border-[#1e293b] text-[10px] text-slate-500 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>Operational Guardrails</span>
          </div>
        </div>
      ) : (
        <div className="p-3 mb-2 flex flex-col items-center gap-2">
          <button
            onClick={() => setCollapsed(false)}
            className="w-8 h-8 rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
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
              className="fixed inset-0 bg-black/60"
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

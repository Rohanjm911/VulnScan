import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { NewScanModal } from './components/common/NewScanModal';
import { CommandPalette } from './components/common/CommandPalette';
import { Dashboard } from './pages/Dashboard';
import { Targets } from './pages/Targets';
import { Reconnaissance } from './pages/Reconnaissance';
import { PortScanner } from './pages/PortScanner';
import { SslAnalyzer } from './pages/SslAnalyzer';
import { HeaderAnalyzer } from './pages/HeaderAnalyzer';
import { VulnerabilityAssessment } from './pages/VulnerabilityAssessment';
import { AiCopilot } from './pages/AiCopilot';
import { CveIntelligence } from './pages/CveIntelligence';
import { ScanHistory } from './pages/ScanHistory';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isNewScanOpen, setIsNewScanOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Auto-Shutdown Watchdog: sends heartbeat while tab is open, and shutdown beacon on tab close
  React.useEffect(() => {
    const pingHeartbeat = () => {
      fetch('/api/v1/heartbeat', { method: 'POST' }).catch(() => {});
    };

    // Immediate initial heartbeat
    pingHeartbeat();

    // Pulse heartbeat every 2.5 seconds
    const interval = setInterval(pingHeartbeat, 2500);

    // On browser tab or window close
    const handleUnload = () => {
      try {
        navigator.sendBeacon('/api/v1/shutdown');
      } catch (err) {
        fetch('/api/v1/shutdown', { method: 'POST', keepalive: true }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const handleStartScanForTarget = (targetId: number) => {
    setIsNewScanOpen(true);
  };

  const handleScanStarted = (scanId: number) => {
    setCurrentTab('history');
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Workspace Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        } w-full`}
      >
        {/* Top Header Bar */}
        <Topbar
          currentTab={currentTab}
          onOpenNewScan={() => setIsNewScanOpen(true)}
          onRefresh={handleRefresh}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
          onNavigate={setCurrentTab}
        />

        {/* Dynamic Page Content with Framer Motion Page Transition */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentTab}-${refreshTrigger}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'dashboard' && (
                <Dashboard
                  onNavigate={setCurrentTab}
                  onOpenNewScan={() => setIsNewScanOpen(true)}
                />
              )}
              {currentTab === 'targets' && (
                <Targets onStartScanForTarget={handleStartScanForTarget} />
              )}
              {currentTab === 'recon' && <Reconnaissance />}
              {currentTab === 'ports' && <PortScanner />}
              {currentTab === 'ssl' && <SslAnalyzer />}
              {currentTab === 'headers' && <HeaderAnalyzer />}
              {currentTab === 'vulns' && <VulnerabilityAssessment />}
              {currentTab === 'ai' && <AiCopilot />}
              {currentTab === 'cve' && <CveIntelligence />}
              {currentTab === 'history' && <ScanHistory />}
              {currentTab === 'reports' && <Reports />}
              {currentTab === 'settings' && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global New Scan Modal */}
      <NewScanModal
        isOpen={isNewScanOpen}
        onClose={() => setIsNewScanOpen(false)}
        onScanStarted={handleScanStarted}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setCurrentTab}
      />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;

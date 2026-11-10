import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scan } from '../types';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { useToast } from '../context/ToastContext';
import { 
  History, 
  Terminal, 
  FileText, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Activity,
  Bug,
  Download,
  CheckCircle2,
  Play
} from 'lucide-react';

interface ScanHistoryProps {
  initialScanId?: number | null;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({ initialScanId }) => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(initialScanId || null);
  const [scanDetail, setScanDetail] = useState<Scan | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'findings'>('logs');
  const [loading, setLoading] = useState(true);
  const { success, warning, error: toastError } = useToast();

  const fetchScans = async () => {
    try {
      const data = await api.getScans();
      setScans(data);
      if (data.length > 0 && !selectedScanId) {
        setSelectedScanId(data[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: number) => {
    try {
      const data = await api.getScanDetail(id);
      setScanDetail(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  useEffect(() => {
    if (selectedScanId) {
      fetchDetail(selectedScanId);
    }
  }, [selectedScanId]);

  // Periodic polling for live scan progress
  useEffect(() => {
    const interval = setInterval(() => {
      fetchScans();
      if (selectedScanId) {
        fetchDetail(selectedScanId);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedScanId]);

  const handleCancelScan = async (id: number) => {
    try {
      await api.cancelScan(id);
      warning('Scan Cancelled', `Assessment run #${id} has been aborted.`);
      fetchScans();
      fetchDetail(id);
    } catch (err: any) {
      toastError('Cancellation Failed', err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scans List */}
        <div className="cyber-card p-5 lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Assessment Runs</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{scans.length} Executed</span>
          </div>

          {loading && scans.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">Loading history telemetry...</div>
          ) : scans.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">No scans executed yet.</div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {scans.map((s) => {
                const isSelected = selectedScanId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedScanId(s.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-glow-electric'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        Scan #{s.id}
                      </span>
                      <StatusBadge status={s.status} />
                    </div>

                    <div className="text-[11px] font-mono text-cyan-400 truncate">
                      {s.scan_type} • Score: {s.security_score}/100
                    </div>

                    <div className="text-[10px] text-slate-400 truncate mt-1">
                      {s.current_stage}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full transition-all duration-500 ${
                          s.status === 'COMPLETED' ? 'bg-emerald-400' :
                          s.status === 'FAILED' ? 'bg-red-400' :
                          s.status === 'CANCELLED' ? 'bg-slate-500' : 'bg-cyan-400 animate-pulse'
                        }`}
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Live Telemetry & Drilldown Details */}
        <div className="cyber-card p-5 lg:col-span-2 space-y-4">
          {scanDetail ? (
            <div>
              {/* Scan Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-heading text-white">
                      Scan #{scanDetail.id} Telemetry & Logs
                    </span>
                    <StatusBadge status={scanDetail.status} />
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Pipeline Stage: <span className="text-cyan-300 font-semibold">{scanDetail.current_stage}</span> ({scanDetail.progress}%)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {scanDetail.status === 'RUNNING' && (
                    <button
                      onClick={() => handleCancelScan(scanDetail.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-500/20"
                    >
                      Abort Run
                    </button>
                  )}

                  <a
                    href={api.generateReportForScanUrl(scanDetail.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-glow-electric"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>

              {/* Tabs for Logs vs Findings */}
              <div className="flex items-center gap-4 border-b border-slate-800 my-4 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`pb-2.5 font-bold transition-colors flex items-center gap-1.5 border-b-2 ${
                    activeTab === 'logs'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Real-time Log Stream ({scanDetail.logs?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('findings')}
                  className={`pb-2.5 font-bold transition-colors flex items-center gap-1.5 border-b-2 ${
                    activeTab === 'findings'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Bug className="w-3.5 h-3.5" />
                  <span>Findings ({scanDetail.findings?.length || 0})</span>
                </button>
              </div>

              {/* Logs Content Tab */}
              {activeTab === 'logs' && (
                <div className="p-4 rounded-xl bg-[#080B14] border border-slate-800 font-mono text-xs max-h-96 overflow-y-auto space-y-1.5">
                  {(!scanDetail.logs || scanDetail.logs.length === 0) ? (
                    <div className="text-slate-600 italic">No execution log messages emitted.</div>
                  ) : (
                    scanDetail.logs.map((log) => {
                      const levelColors: Record<string, string> = {
                        INFO: 'text-slate-400',
                        SUCCESS: 'text-emerald-400 font-bold',
                        WARNING: 'text-amber-400',
                        ERROR: 'text-red-400 font-bold'
                      };
                      return (
                        <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-slate-600 text-[10px] select-none">
                            {log.timestamp ? log.timestamp.substring(11, 19) : ''}
                          </span>
                          <span className={`text-[10px] uppercase font-bold ${levelColors[log.level] || 'text-slate-400'}`}>
                            [{log.level}]
                          </span>
                          <span className="text-slate-200">{log.message}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Findings Content Tab */}
              {activeTab === 'findings' && (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {(!scanDetail.findings || scanDetail.findings.length === 0) ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-mono">
                      No security vulnerabilities discovered in this assessment run.
                    </div>
                  ) : (
                    scanDetail.findings.map((f) => (
                      <div key={f.id} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white font-heading">{f.title}</span>
                          <SeverityBadge severity={f.severity} size="sm" />
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{f.description}</p>
                        {f.remediation && (
                          <p className="text-emerald-400 text-[11px] font-mono">
                            Remediation: {f.remediation}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs font-mono">
              Select an assessment run from the history column to inspect live telemetry.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

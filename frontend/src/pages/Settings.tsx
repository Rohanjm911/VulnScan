import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Settings as SettingsIcon, Shield, Sliders, Database, Activity, Check, AlertTriangle, RotateCcw, Download } from 'lucide-react';

export const Settings: React.FC = () => {
  const [config, setConfig] = useState<any>({
    safe_mode: true,
    ssrf_protection: true,
    allow_local_targets: true,
    default_timeout_sec: 8.0,
    max_concurrent_ports: 50
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, warning, error: toastError } = useToast();

  const fetchSettingsAndLogs = async () => {
    try {
      setLoading(true);
      const [cfg, logs] = await Promise.all([
        api.getSettings(),
        api.getAuditLogs()
      ]);
      setConfig(cfg);
      setAuditLogs(logs);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndLogs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(config);
      success('Settings Applied', 'Scanning engine guardrails and network policies updated.');
    } catch (err: any) {
      toastError('Save Error', err.message);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('This will wipe all historical targets, scans, and findings to start completely fresh with real data. Proceed?')) {
      return;
    }
    try {
      const res = await api.resetDemoData();
      warning('Database Reset', res.message);
      fetchSettingsAndLogs();
    } catch (err: any) {
      toastError('Reset Error', err.message);
    }
  };

  const handleExportAuditLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vulnscan_audit_logs_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    success('Export Complete', 'Audit log telemetry downloaded as JSON.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Settings Form */}
      <div className="cyber-card p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
              Scanning Engine Guardrails & Security Policies
            </h3>
          </div>

          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Target & Scan Data</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Safe Mode Toggle */}
            <div className="p-4 rounded-xl bg-[#131722] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Strict Non-Destructive Safe Mode</span>
                <span className="text-slate-400 text-[11px]">
                  Enforces non-destructive canary payloads only. Forbids state-altering payloads.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.safe_mode}
                onChange={(e) => setConfig({ ...config, safe_mode: e.target.checked })}
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* SSRF Protection */}
            <div className="p-4 rounded-xl bg-[#131722] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">SSRF & Loopback Protection</span>
                <span className="text-slate-400 text-[11px]">
                  Blocks resolution to RFC1918 private subnets, cloud metadata (169.254.169.254), and broadcast.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.ssrf_protection}
                onChange={(e) => setConfig({ ...config, ssrf_protection: e.target.checked })}
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Allow Localhost for Dev Testing */}
            <div className="p-4 rounded-xl bg-[#131722] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Allow Local Testing Targets</span>
                <span className="text-slate-400 text-[11px]">
                  Allows authorized developer scans on local lab hosts (e.g. 127.0.0.1, localhost).
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.allow_local_targets}
                onChange={(e) => setConfig({ ...config, allow_local_targets: e.target.checked })}
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Timeout */}
            <div className="p-4 rounded-xl bg-[#131722] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Network Socket Timeout (Seconds)</span>
                <span className="text-slate-400 text-[11px]">
                  Abort HTTP probes and TCP handshakes exceeding threshold.
                </span>
              </div>
              <input
                type="number"
                min="2"
                max="30"
                step="0.5"
                value={config.default_timeout_sec}
                onChange={(e) => setConfig({ ...config, default_timeout_sec: parseFloat(e.target.value) })}
                className="w-20 px-2 py-1 rounded bg-[#0b0f19] border border-slate-700 text-slate-200 font-mono text-center"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium uppercase tracking-wider transition-colors"
            >
              Apply Engine Settings
            </button>
          </div>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="cyber-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
              Immutable Security Audit Trail
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">{auditLogs.length} Events</span>
            <button
              onClick={handleExportAuditLogs}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#131722] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            No audit log entries recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="pb-3 px-3">Timestamp</th>
                  <th className="pb-3 px-3">Action</th>
                  <th className="pb-3 px-3">Target Scope</th>
                  <th className="pb-3 px-3">Details</th>
                  <th className="pb-3 px-3">Origin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {log.timestamp ? log.timestamp.substring(0, 19).replace('T', ' ') : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-200 text-[11px] truncate max-w-[200px]">
                      {log.target_url || 'System'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-xs truncate max-w-[280px]">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {log.ip_origin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

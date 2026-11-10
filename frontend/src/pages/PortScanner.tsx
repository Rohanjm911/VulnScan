import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Target } from '../types';
import { useToast } from '../context/ToastContext';
import { Network, Search, AlertTriangle, ShieldCheck, Terminal, Cpu, Crosshair, Copy, Check } from 'lucide-react';

export const PortScanner: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('https://scanme.nmap.org');
  const [targets, setTargets] = useState<Target[]>([]);
  const [customPorts, setCustomPorts] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    api.getTargets().then((data) => {
      setTargets(data);
      if (data.length > 0) {
        setTargetUrl(data[0].url);
      }
    }).catch(() => {});
  }, []);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);

    let parsedPorts: number[] | undefined = undefined;
    if (customPorts.trim()) {
      parsedPorts = customPorts
        .split(',')
        .map((p) => parseInt(p.trim(), 10))
        .filter((p) => !isNaN(p) && p > 0 && p <= 65535);
    }

    try {
      const data = await api.scanPorts(targetUrl.trim(), parsedPorts);
      setResult(data);
      success('Port Scan Finished', `Found ${data.total_open} open service ports on ${data.host}`);
    } catch (err: any) {
      setError(err.message || 'Port scan execution failed.');
      toastError('Scan Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyPortPreset = (preset: string) => {
    if (preset === 'web') setCustomPorts('80, 443, 8080, 8443, 3000, 8000');
    if (preset === 'infra') setCustomPorts('21, 22, 23, 25, 53, 110, 445');
    if (preset === 'database') setCustomPorts('3306, 5432, 6379, 27017, 1433');
    if (preset === 'all') setCustomPorts('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Configuration bar */}
      <div className="cyber-card p-5 space-y-4">
        {targets.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-purple-300 uppercase flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Select Target Scope:</span>
            </span>
            <select
              onChange={(e) => setTargetUrl(e.target.value)}
              className="px-2.5 py-1 rounded bg-[#0F0A1F] border border-[#2E1E54] text-purple-200 text-xs focus:border-purple-400 focus:outline-none"
            >
              {targets.map((t) => (
                <option key={t.id} value={t.url}>
                  {t.name} ({t.url})
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleScan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono uppercase text-purple-300 mb-1.5">
                Target Domain or Hostname
              </label>
              <div className="relative">
                <Network className="absolute left-3.5 top-3 w-4 h-4 text-fuchsia-400" />
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com or 192.0.2.1"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-slate-200 text-xs font-mono focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase text-purple-300">
                  Target Ports
                </label>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-fuchsia-400">
                  <button type="button" onClick={() => applyPortPreset('web')} className="hover:underline">Web</button>
                  <span>•</span>
                  <button type="button" onClick={() => applyPortPreset('database')} className="hover:underline">DB</button>
                  <span>•</span>
                  <button type="button" onClick={() => applyPortPreset('all')} className="hover:underline">All</button>
                </div>
              </div>
              <input
                type="text"
                value={customPorts}
                onChange={(e) => setCustomPorts(e.target.value)}
                placeholder="Leave blank for top 20 ports"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-slate-200 text-xs font-mono focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safe TCP Connect with non-destructive graceful socket closure</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-synth transition-all flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{loading ? 'Scanning Ports...' : 'Execute Port Scan'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="cyber-card p-4">
              <span className="text-[10px] font-mono uppercase text-purple-400">Target Host</span>
              <p className="text-sm font-bold text-white font-mono">{result.host}</p>
            </div>
            <div className="cyber-card p-4">
              <span className="text-[10px] font-mono uppercase text-purple-400">Resolved IP</span>
              <p className="text-sm font-bold text-purple-300 font-mono">{result.ip || 'Unresolved'}</p>
            </div>
            <div className="cyber-card p-4">
              <span className="text-[10px] font-mono uppercase text-purple-400">Open Ports Identified</span>
              <p className="text-sm font-bold text-emerald-400 font-mono">{result.total_open} Ports Active</p>
            </div>
          </div>

          {/* Port Table */}
          <div className="cyber-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
                Discovered Open Ports & Service Banners
              </h3>
            </div>

            {result.total_open === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-mono">
                No open ports detected in target port list or connection timed out gracefully.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#2E1E54] text-slate-400 text-[10px] uppercase">
                      <th className="pb-3 px-3">Port</th>
                      <th className="pb-3 px-3">Protocol</th>
                      <th className="pb-3 px-3">State</th>
                      <th className="pb-3 px-3">Service</th>
                      <th className="pb-3 px-3">Banner / Header Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2E1E54]/60 font-sans">
                    {result.open_ports.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#1A1136]/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-fuchsia-400">
                          {p.port}
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono">
                          {p.protocol}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {p.state}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-200">
                          {p.service}
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px] truncate max-w-[320px]">
                          {p.banner || <span className="text-slate-600 italic">No banner returned</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

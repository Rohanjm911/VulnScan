import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Target } from '../types';
import { useToast } from '../context/ToastContext';
import { FileCode, Search, CheckCircle2, XCircle, AlertTriangle, Copy, Check, Crosshair } from 'lucide-react';
import { SeverityBadge } from '../components/common/SeverityBadge';

export const HeaderAnalyzer: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    api.getTargets().then((data) => {
      setTargets(data);
      if (data.length > 0) {
        setTargetUrl(data[0].url);
      }
    }).catch(() => {});
  }, []);

  const handleAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.analyzeHeaders(targetUrl.trim());
      setResult(data);
      success('Header Audit Complete', `Audited response headers for ${data.target_url} with Score ${data.score}/100`);
    } catch (err: any) {
      setError(err.message || 'Header audit failed.');
      toastError('Audit Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    success('Directive Copied', 'Copied header directive to clipboard.');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Search Bar & Target Selector */}
      <div className="cyber-card p-5 space-y-3">
        {targets.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-purple-300 uppercase flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Select Authorized Target:</span>
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

        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <FileCode className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Enter target URL (e.g. https://example.com)"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-slate-200 text-xs font-mono focus:border-purple-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-synth transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{loading ? 'Auditing Headers...' : 'Audit Headers'}</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="cyber-card p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-400">Header Defense Grade</span>
                <p className={`text-4xl font-black font-heading mt-1 ${
                  result.grade === 'A+' || result.grade === 'A' ? 'text-emerald-400' :
                  result.grade === 'B' ? 'text-cyan-400' :
                  result.grade === 'C' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {result.grade}
                </p>
              </div>
              <span className="text-2xl font-black font-heading text-purple-300">
                {result.score} / 100
              </span>
            </div>

            <div className="cyber-card p-5">
              <span className="text-[10px] font-mono uppercase text-purple-400">Active Defense Directives</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {result.passed_headers?.length || 0} Configured
              </p>
              <p className="text-xs text-slate-400 mt-1">Browser security enforced</p>
            </div>

            <div className="cyber-card p-5">
              <span className="text-[10px] font-mono uppercase text-purple-400">Missing Critical Directives</span>
              <p className="text-2xl font-bold font-mono text-red-400 mt-1">
                {result.missing_headers?.length || 0} Deficiencies
              </p>
              <p className="text-xs text-slate-400 mt-1">Requiring immediate policy update</p>
            </div>
          </div>

          {/* Missing Headers (Deficiencies & Remediation) */}
          <div className="cyber-card p-5">
            <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Missing Defense-in-Depth Headers & Remediation Guide</span>
            </h3>

            {(!result.missing_headers || result.missing_headers.length === 0) ? (
              <div className="p-8 text-center text-emerald-400 text-xs font-mono">
                ✓ All primary security headers are properly implemented and enforced!
              </div>
            ) : (
              <div className="space-y-4">
                {result.missing_headers.map((h: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#130D29] border border-red-500/25 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm font-heading">{h.name}</span>
                      <SeverityBadge severity={h.importance} size="sm" />
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{h.description}</p>
                    <div className="p-2.5 rounded-lg bg-[#0A0714] border border-[#2E1E54] flex items-center justify-between font-mono text-fuchsia-300 text-[11px]">
                      <span className="truncate">{h.recommendation}</span>
                      <button
                        onClick={() => copyToClipboard(h.recommendation, h.key)}
                        className="ml-2 p-1 text-slate-400 hover:text-white transition-colors"
                        title="Copy Directive"
                      >
                        {copiedKey === h.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Passed Headers */}
          <div className="cyber-card p-5">
            <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Properly Configured Defense Headers</span>
            </h3>

            {result.passed_headers?.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4">No defense headers detected.</p>
            ) : (
              <div className="space-y-2">
                {result.passed_headers.map((h: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#120D26] border border-emerald-500/20 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-emerald-400">{h.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PASS</span>
                    </div>
                    <p className="font-mono text-slate-300 text-[11px] truncate bg-[#0A0714] p-1.5 rounded mt-1">{h.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

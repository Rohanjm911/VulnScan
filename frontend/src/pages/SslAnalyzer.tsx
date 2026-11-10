import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Target } from '../types';
import { useToast } from '../context/ToastContext';
import { Lock, Search, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Calendar, Key, Crosshair } from 'lucide-react';

export const SslAnalyzer: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('https://google.com');
  const [targets, setTargets] = useState<Target[]>([]);
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

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.analyzeSsl(targetUrl.trim());
      setResult(data);
      success('SSL Inspection Finished', `Verified TLS configuration for ${data.host} with Grade ${data.analysis?.grade}`);
    } catch (err: any) {
      setError(err.message || 'SSL/TLS inspection failed.');
      toastError('SSL Audit Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.analysis;

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

        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Enter HTTPS domain (e.g. https://google.com or example.com)"
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
            <span>{loading ? 'Inspecting...' : 'Audit SSL / TLS'}</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {analysis && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Grade & Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="cyber-card p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-400">SSL Security Grade</span>
                <p className={`text-4xl font-black font-heading mt-1 ${
                  analysis.grade === 'A+' || analysis.grade === 'A' ? 'text-emerald-400' :
                  analysis.grade === 'B' ? 'text-cyan-400' :
                  analysis.grade === 'C' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {analysis.grade}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-fuchsia-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="cyber-card p-5">
              <span className="text-[10px] font-mono uppercase text-purple-400">Certificate Trust</span>
              <div className="mt-2 flex items-center gap-2">
                {analysis.is_valid ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Valid & Trusted CA
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                    <XCircle className="w-3.5 h-3.5" />
                    Untrusted / Warning
                  </span>
                )}
              </div>
            </div>

            <div className="cyber-card p-5">
              <span className="text-[10px] font-mono uppercase text-purple-400">Expiration Countdown</span>
              <p className="text-xl font-bold font-mono text-white mt-1">
                {analysis.days_remaining !== null ? `${analysis.days_remaining} Days Remaining` : 'N/A'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Expires: {analysis.valid_to ? analysis.valid_to.substring(0, 10) : 'Unknown'}
              </p>
            </div>

            <div className="cyber-card p-5">
              <span className="text-[10px] font-mono uppercase text-purple-400">TLS Protocol Handshake</span>
              <p className="text-xl font-bold font-mono text-fuchsia-400 mt-1">
                {analysis.tls_version || 'None'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Supported: {analysis.supported_protocols?.join(', ') || 'N/A'}
              </p>
            </div>
          </div>

          {/* Warnings Strip */}
          {analysis.warnings?.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <h4 className="text-xs font-bold text-amber-400 uppercase font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Security Warnings Identified:</span>
              </h4>
              <ul className="list-disc list-inside text-xs text-amber-300 space-y-1 pt-1">
                {analysis.warnings.map((w: string, idx: number) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Certificate Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Issuer & Subject Details */}
            <div className="cyber-card p-5 space-y-4">
              <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-fuchsia-400" />
                <span>Certificate Identity & Issuer</span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#120D26] border border-[#2E1E54]">
                  <span className="text-purple-400 block text-[10px] uppercase">Issuer CA:</span>
                  <p className="text-slate-200 mt-0.5">{analysis.issuer?.organizationName || 'Unknown CA'}</p>
                  <p className="text-slate-400 text-[11px]">{analysis.issuer?.commonName || ''}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#120D26] border border-[#2E1E54]">
                  <span className="text-purple-400 block text-[10px] uppercase">Subject Domain:</span>
                  <p className="text-slate-200 mt-0.5">{analysis.subject?.commonName || result.host}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#120D26] border border-[#2E1E54]">
                  <span className="text-purple-400 block text-[10px] uppercase">Cipher Suite:</span>
                  <p className="text-fuchsia-300 mt-0.5">{analysis.cipher?.name || 'N/A'}</p>
                  <p className="text-slate-400 text-[11px]">{analysis.cipher?.bits} bits encryption</p>
                </div>
              </div>
            </div>

            {/* Subject Alternative Names (SANs) */}
            <div className="cyber-card p-5">
              <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Subject Alternative Names (SANs)</span>
              </h3>
              <p className="text-xs text-purple-300/70 mb-3">Domains protected under this certificate:</p>

              {analysis.san?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {analysis.san.map((s: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 rounded bg-[#120D26] border border-[#2E1E54] text-purple-200 font-mono text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No SAN domains listed</p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

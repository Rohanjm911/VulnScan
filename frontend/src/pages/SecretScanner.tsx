import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  KeyRound, 
  Search, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  ExternalLink, 
  FileCode,
  ShieldCheck,
  EyeOff
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { SecretScanResult } from '../types';

export const SecretScanner: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SecretScanResult | null>(null);

  const { success, error: toastError } = useToast();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    try {
      const res = await api.scanSecrets({ target_url: targetUrl.trim() });
      setResult(res);
      success(
        'Secret Scan Finished',
        `Scanned ${res.scripts_scanned} script bundles. Identified ${res.secrets_count} exposed secret(s).`
      );
    } catch (err: any) {
      toastError('Secret Scan Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#232936]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-primary-400" />
            Client-Side Secrets & Leaked API Key Detector
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deep-crawls target web pages and client JavaScript bundles for exposed cloud credentials, payment keys, OpenAI tokens, and OAuth secrets.
          </p>
        </div>
      </div>

      {/* Target Input Card */}
      <div className="bg-[#131722] border border-[#232936] rounded-xl p-5 shadow-lg">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Target Web Application URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://app.target.com"
                className="w-full bg-[#0d1017] border border-[#232936] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 font-mono"
                required
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Extracts inline & external script bundles and checks against regex signatures for OpenAI, AWS, Stripe, GitHub, Firebase, and Slack keys.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <KeyRound className="w-4 h-4 animate-spin" />
                  Decompiling Client Bundles...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Extract & Scan JavaScript Bundles
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Target Scanned</span>
              <div className="text-sm font-bold text-white font-mono mt-2 truncate">
                {result.target_url}
              </div>
            </div>

            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">JavaScript Bundles Scanned</span>
              <div className="text-2xl font-bold text-white mt-2">
                {result.scripts_scanned}
              </div>
            </div>

            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4">
              <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Exposed Credentials
              </span>
              <div className="text-2xl font-bold text-rose-400 mt-2">
                {result.secrets_count}
              </div>
            </div>
          </div>

          {/* Secrets List */}
          <div className="bg-[#131722] border border-[#232936] rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-[#232936] flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-400" />
                Detected Secrets & Tokens ({result.secrets.length})
              </h2>
            </div>

            {result.secrets.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-white">Clean Bill of Health: No Leaked Secrets</p>
                <p className="text-xs text-slate-500 mt-1">Target frontend bundles and inline tags do not expose private tokens or high-risk keys.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#232936]">
                {result.secrets.map((sec, idx) => (
                  <div key={idx} className="p-5 hover:bg-[#181d2a] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <SeverityBadge severity={sec.severity as any} />
                        <span className="text-sm font-bold text-white">
                          {sec.secret_type}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 truncate max-w-md">
                        {sec.source_url}
                      </span>
                    </div>

                    <div className="my-2 p-2.5 rounded bg-[#0d1017] border border-[#232936] flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <EyeOff className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-400">Masked Token:</span>
                        <span className="text-rose-400 font-bold tracking-wider">{sec.masked_value}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{sec.source_type}</span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      {sec.description}
                    </p>

                    <div className="mt-2.5 p-2.5 rounded bg-[#161f2f] border border-blue-900/40 text-xs font-mono text-blue-300">
                      Action: {sec.remediation}
                    </div>
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


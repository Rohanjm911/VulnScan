import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Target } from '../types';
import { useToast } from '../context/ToastContext';
import { 
  Globe2, 
  Search, 
  Server, 
  Layers, 
  Network, 
  CheckCircle, 
  AlertCircle,
  Cpu,
  Cookie,
  Crosshair,
  Copy,
  Check
} from 'lucide-react';

export const Reconnaissance: React.FC = () => {
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

  const handleInspect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.inspectRecon(targetUrl.trim());
      setResult(data);
      success('Recon Complete', `Identified DNS records and fingerprinted web stack for ${data.host}`);
    } catch (err: any) {
      setError(err.message || 'Reconnaissance analysis failed.');
      toastError('Recon Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    success('Copied', `Copied ${key} record to clipboard.`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Search Bar & Target Quick Switcher */}
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

        <form onSubmit={handleInspect} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Globe2 className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Enter target domain or URL (e.g. https://example.com)"
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
            <span>{loading ? 'Discovering...' : 'Execute Recon'}</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recon Results Workspace */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Target Identity Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="cyber-card p-4 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <Globe2 className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono text-purple-400 uppercase">Target Host</span>
                <p className="text-sm font-bold text-white truncate font-mono">{result.host}</p>
              </div>
            </div>

            <div className="cyber-card p-4 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Network className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Resolved IP</span>
                <p className="text-sm font-bold text-white truncate font-mono">{result.ip || 'Unresolved'}</p>
              </div>
            </div>

            <div className="cyber-card p-4 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30">
                <Server className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono text-purple-400 uppercase">Web Server Banner</span>
                <p className="text-sm font-bold text-white truncate font-mono">
                  {result.technology_fingerprint?.server || 'Suppressed'}
                </p>
              </div>
            </div>
          </div>

          {/* Technology Fingerprints Card */}
          <div className="cyber-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-fuchsia-400" />
              <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
                Technology Fingerprint & Framework Inventory
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-mono text-purple-300 block mb-2">Detected Technologies:</span>
                <div className="flex flex-wrap gap-2">
                  {result.technology_fingerprint?.technologies?.length > 0 ? (
                    result.technology_fingerprint.technologies.map((tech: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 font-mono text-xs">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No overt stack banners detected</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-purple-300 block mb-2">Identified Frameworks:</span>
                <div className="flex flex-wrap gap-2">
                  {result.technology_fingerprint?.frameworks?.length > 0 ? (
                    result.technology_fingerprint.frameworks.map((fw: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 font-mono text-xs">
                        {fw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No framework identifiers disclosed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Cookies Signature */}
            {result.technology_fingerprint?.cookies?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#2E1E54]">
                <span className="text-xs font-mono text-purple-300 flex items-center gap-1.5 mb-2">
                  <Cookie className="w-3.5 h-3.5 text-amber-400" />
                  <span>Observed Session Cookie Signatures:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.technology_fingerprint.cookies.map((c: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-[#100B22] border border-[#2E1E54] text-purple-200 font-mono text-[11px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DNS Records Table & Subdomains */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DNS Records */}
            <div className="cyber-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
                  DNS Record Telemetry
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(result.dns_records || {}).map(([rtype, rdata]: [string, any]) => (
                  <div key={rtype} className="p-3 rounded-lg bg-[#120D26] border border-[#2E1E54] text-xs flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-fuchsia-400 mr-2">[{rtype}]</span>
                      {rdata.length > 0 ? (
                        <span className="font-mono text-slate-200 break-all">{rdata.join(', ')}</span>
                      ) : (
                        <span className="text-slate-600 italic">No record found</span>
                      )}
                    </div>
                    {rdata.length > 0 && (
                      <button
                        onClick={() => copyToClipboard(rdata.join(', '), rtype)}
                        className="text-slate-500 hover:text-white p-1"
                        title={`Copy ${rtype} record`}
                      >
                        {copiedKey === rtype ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Discovered Subdomains */}
            <div className="cyber-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-fuchsia-400" />
                  <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
                    In-Scope Subdomains
                  </h3>
                </div>
                <span className="text-xs font-mono text-purple-400">
                  {result.subdomains?.length || 0} discovered
                </span>
              </div>

              {(!result.subdomains || result.subdomains.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No public subdomains discovered matching common dictionary patterns.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {result.subdomains.map((sub: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#120D26] border border-[#2E1E54] text-xs font-mono">
                      <span className="text-slate-200">{sub.subdomain}</span>
                      <span className="text-purple-400">{sub.ip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

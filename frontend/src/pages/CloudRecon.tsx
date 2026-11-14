import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  ExternalLink, 
  Database, 
  Globe, 
  Layers,
  Server,
  CloudOff
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { CloudReconResult } from '../types';

export const CloudRecon: React.FC = () => {
  const [domain, setDomain] = useState('example.com');
  const [checkTakeover, setCheckTakeover] = useState(true);
  const [checkBuckets, setCheckBuckets] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CloudReconResult | null>(null);

  const { success, error: toastError } = useToast();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    try {
      const res = await api.scanCloudRecon({
        domain: domain.trim(),
        check_takeover: checkTakeover,
        check_buckets: checkBuckets,
      });
      setResult(res);
      success(
        'Cloud Recon Finished',
        `Scanned ${res.total_assets_scanned} cloud assets. ${res.critical_issues} critical risk(s) identified.`
      );
    } catch (err: any) {
      toastError('Recon Failed', err.message);
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
            <Cloud className="w-6 h-6 text-primary-400" />
            Subdomain Takeover & Cloud Bucket Scanner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Detect dangling CNAME records susceptible to subdomain takeover (AWS S3, GitHub Pages, Heroku) and audit exposed cloud object storage.
          </p>
        </div>
      </div>

      {/* Target Domain Input Card */}
      <div className="bg-[#131722] border border-[#232936] rounded-xl p-5 shadow-lg">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Root Domain or Target Hostname
            </label>
            <div className="relative">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="domain.com (e.g. stripe.com or internal-app.io)"
                className="w-full bg-[#0d1017] border border-[#232936] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkTakeover}
                  onChange={(e) => setCheckTakeover(e.target.checked)}
                  className="rounded border-[#232936] bg-[#0d1017] text-primary-600 focus:ring-0"
                />
                Dangling CNAME Takeovers
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkBuckets}
                  onChange={(e) => setCheckBuckets(e.target.checked)}
                  className="rounded border-[#232936] bg-[#0d1017] text-primary-600 focus:ring-0"
                />
                AWS S3 & GCP Public Buckets
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Cloud className="w-4 h-4 animate-spin" />
                  Enumerating Cloud Infrastructure...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Scan Cloud Assets
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Domain Analyzed</span>
              <div className="text-lg font-bold text-white font-mono mt-2 truncate">
                {result.domain}
              </div>
            </div>

            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Total Assets Inspected</span>
              <div className="text-2xl font-bold text-white mt-2">
                {result.total_assets_scanned}
              </div>
            </div>

            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4">
              <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Critical Vulnerabilities
              </span>
              <div className="text-2xl font-bold text-rose-400 mt-2">
                {result.critical_issues}
              </div>
            </div>

            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4">
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> High Risk Assets
              </span>
              <div className="text-2xl font-bold text-amber-400 mt-2">
                {result.high_issues}
              </div>
            </div>
          </div>

          {/* Subdomain Takeover Table */}
          <div className="bg-[#131722] border border-[#232936] rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-[#232936] flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-400" />
                Subdomain Takeover Findings ({result.subdomain_takeovers.length})
              </h2>
            </div>

            {result.subdomain_takeovers.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">No Vulnerable Subdomains Discovered</p>
                <p className="text-xs text-slate-500 mt-1">All verified CNAME records point to active or internal endpoints.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#232936]">
                {result.subdomain_takeovers.map((item, idx) => (
                  <div key={idx} className="p-4 hover:bg-[#181d2a] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <SeverityBadge severity={item.severity as any} />
                        <span className="text-sm font-bold text-white font-mono">
                          {item.subdomain}
                        </span>
                        <span className="text-xs text-slate-400">→</span>
                        <span className="text-xs text-cyan-400 font-mono">
                          {item.cname_target}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-xs font-semibold">
                        {item.service}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      {item.description}
                    </p>

                    <div className="mt-2.5 p-2.5 rounded bg-[#0d1017] border border-[#232936] text-xs font-mono text-emerald-300">
                      Fix: {item.remediation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cloud Storage Buckets Table */}
          <div className="bg-[#131722] border border-[#232936] rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-[#232936] flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-primary-400" />
                Discovered Cloud Storage Buckets ({result.cloud_buckets.length})
              </h2>
            </div>

            {result.cloud_buckets.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">No Public Buckets Leaked</p>
                <p className="text-xs text-slate-500 mt-1">Permutation tests for standard AWS S3 and GCP storage returned 404/Non-existent.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#232936]">
                {result.cloud_buckets.map((b, idx) => (
                  <div key={idx} className="p-4 hover:bg-[#181d2a] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <SeverityBadge severity={b.severity as any} />
                        <span className="text-sm font-bold text-white font-mono">
                          {b.bucket_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          b.status === 'PUBLIC_READ_EXPOSED'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        {b.provider} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      {b.description}
                    </p>

                    <div className="mt-2.5 p-2.5 rounded bg-[#0d1017] border border-[#232936] text-xs font-mono text-slate-300">
                      Recommendation: {b.remediation}
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


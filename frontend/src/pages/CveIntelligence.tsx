import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CveItem } from '../types';
import { api } from '../api/client';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { useToast } from '../context/ToastContext';
import { Database, Search, ExternalLink, ShieldAlert, Cpu, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

export const CveIntelligence: React.FC = () => {
  const [cves, setCves] = useState<CveItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Live Banner Check state
  const [bannerInput, setBannerInput] = useState('Apache/2.4.49');
  const [checkingBanner, setCheckingBanner] = useState(false);
  const [bannerMatches, setBannerMatches] = useState<any[] | null>(null);

  const { success, error: toastError } = useToast();

  const fetchCves = async (search?: string) => {
    try {
      setLoading(true);
      const res = await api.getCveDatabase(search);
      setCves(res.items);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCves(searchTerm);
  }, [searchTerm]);

  const handleCheckBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerInput.trim()) return;
    setCheckingBanner(true);

    try {
      const res = await api.checkBannerCve(bannerInput.trim(), [bannerInput.split('/')[0]]);
      setBannerMatches(res.matches);
      success('Correlation Finished', `Identified ${res.matched_count} potential CVE correlation(s) for ${bannerInput}`);
    } catch (err: any) {
      toastError('Correlation Error', err.message);
    } finally {
      setCheckingBanner(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Live Server Banner Check Bar */}
      <div className="cyber-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-fuchsia-400" />
          <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
            Live Server Banner & Fingerprint CVE Correlator
          </h3>
        </div>
        <p className="text-xs text-purple-300/70">
          Test web server banners against the CVE intelligence rule engine to discover potential vulnerabilities.
        </p>

        <form onSubmit={handleCheckBanner} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={bannerInput}
            onChange={(e) => setBannerInput(e.target.value)}
            placeholder="e.g. Apache/2.4.49, nginx/1.18.0, OpenSSH_8.2p1, Spring-Boot/2.5.0"
            className="w-full pl-4 pr-4 py-2.5 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-slate-200 text-xs font-mono focus:border-purple-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={checkingBanner}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-synth transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {checkingBanner ? 'Matching...' : 'Correlate CVEs'}
          </button>
        </form>

        {bannerMatches !== null && (
          <div className="p-4 rounded-xl bg-[#140E29] border border-purple-500/30 text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-[#2E1E54]">
              <span className="font-bold text-white font-heading">
                Matches for: <code className="text-fuchsia-300">{bannerInput}</code>
              </span>
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                bannerMatches.length > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                {bannerMatches.length} CVEs Detected
              </span>
            </div>

            {bannerMatches.length === 0 ? (
              <p className="text-slate-400 italic">No CVEs matched for this banner in active database.</p>
            ) : (
              <div className="space-y-2">
                {bannerMatches.map((m: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-purple-300">{m.cve_id}</span>
                        <SeverityBadge severity={m.severity} size="sm" />
                      </div>
                      <p className="text-slate-300">{m.title}</p>
                      <p className="text-emerald-400 font-mono text-[11px] mt-1">Remediation: {m.remediation}</p>
                    </div>
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${m.cve_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 font-mono"
                    >
                      <span>NVD</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Header for Database */}
      <div className="cyber-card p-5 space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search CVE ID (e.g. CVE-2021-41773), software (Apache, Nginx, PHP, Spring)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-slate-200 text-xs font-mono focus:border-purple-400 focus:outline-none"
          />
        </div>

        {/* Disclaimer Banner */}
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-200 text-[11px] flex items-center gap-2 font-mono">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-fuchsia-400" />
          <span>
            <strong>Methodology Standard:</strong> VulnScan matches software fingerprint versions against known CVE records. Potential exposure indicates version correlation and requires secondary context verification.
          </span>
        </div>
      </div>

      {/* CVE Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cves.length === 0 ? (
        <div className="p-12 text-center cyber-card">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300 font-heading">No CVE Records Match Query</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try a broader search term like 'Apache', 'OpenSSH', or 'Spring'.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cves.map((cve, idx) => (
            <div key={idx} className="cyber-card p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-300 text-sm">
                      {cve.cve_id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/25">
                      CVSS {cve.cvss}
                    </span>
                  </div>
                  <SeverityBadge severity={cve.severity} size="sm" />
                </div>

                <h4 className="text-sm font-bold font-heading text-white mb-1">
                  {cve.title}
                </h4>

                <div className="flex items-center gap-2 text-[11px] font-mono text-fuchsia-400 mb-2">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Target Component: {cve.software}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {cve.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#2E1E54] space-y-2">
                <div className="text-[11px] font-mono text-emerald-400">
                  <strong className="text-slate-400">Remediation: </strong>
                  {cve.remediation}
                </div>

                <div className="flex items-center gap-3 pt-1 text-[11px] font-mono">
                  <a
                    href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 hover:underline"
                  >
                    <span>NVD Entry</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve.cve_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-300 flex items-center gap-1 hover:underline"
                  >
                    <span>Mitre CVE</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

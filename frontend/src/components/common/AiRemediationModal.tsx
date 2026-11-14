import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldAlert, 
  Code, 
  FileCheck, 
  Cpu,
  Flame,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Finding } from '../../types';
import { api } from '../../api/client';
import { SeverityBadge } from './SeverityBadge';

interface AiRemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding: Finding | null;
  targetUrl?: string;
}

export const AiRemediationModal: React.FC<AiRemediationModalProps> = ({
  isOpen,
  onClose,
  finding,
  targetUrl,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'python' | 'javascript' | 'config'>('python');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && finding) {
      setLoading(true);
      api.remediateFinding({
        finding_id: finding.id,
        title: finding.title,
        category: finding.category,
        severity: finding.severity,
        evidence: finding.evidence,
        target_url: targetUrl || '',
      })
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData(null);
      setCopied(false);
    }
  }, [isOpen, finding, targetUrl]);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const patch = data?.remediation;
  const epss = data?.epss_threat_prediction;

  return (
    <AnimatePresence>
      {isOpen && finding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="bg-[#111827] border border-[#1e293b] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative z-10"
          >
          {/* Header */}
          <div className="p-4 border-b border-[#1e293b] bg-[#0d121f] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    AI Remediation & Patch Synthesizer
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    HYBRID AI/ML
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono truncate max-w-lg mt-0.5">
                  Target Finding: {finding.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 font-mono text-xs">
                  Synthesizing multi-language security patches & calculating ML EPSS threat velocity...
                </p>
              </div>
            ) : patch ? (
              <>
                {/* ML Threat Prediction Bar */}
                {epss && (
                  <div className="p-3.5 rounded-lg bg-[#0d121f] border border-[#1e293b] grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-red-950/40 text-red-400 border border-red-800">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">ML EPSS Velocity</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-bold font-mono text-red-400">{epss.epss_percentage}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({epss.tier} TIER)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-amber-950/40 text-amber-400 border border-amber-800">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">Threat Percentile</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-bold font-mono text-amber-300">{epss.percentile}</span>
                          <span className="text-[10px] text-slate-500 font-mono">VS WILD CVEs</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-blue-950/40 text-blue-400 border border-blue-800">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">Recommended SLA</span>
                        <span className="text-sm font-bold font-mono text-blue-300">{epss.remediation_sla}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Finding Summary Bar */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0d121f] border border-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={finding.severity} size="sm" />
                    <span className="text-slate-300 font-medium">{finding.category}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    CVSS {finding.cvss_score || 'N/A'} • {finding.cve_id || 'CWE Verification'}
                  </span>
                </div>

                {/* Root Cause & Vulnerability Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Root Cause Analysis
                    </span>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      {patch.root_cause}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Remediation Strategy
                    </span>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      {patch.fix_summary}
                    </p>
                  </div>
                </div>

                {/* Code Patches Tabs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-blue-400" />
                      <span>Production-Ready Code Patches</span>
                    </span>

                    <div className="flex items-center gap-1 bg-[#0d121f] p-1 rounded-lg border border-[#1e293b]">
                      <button
                        onClick={() => setActiveTab('python')}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                          activeTab === 'python'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Python / FastAPI
                      </button>
                      <button
                        onClick={() => setActiveTab('javascript')}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                          activeTab === 'javascript'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Node.js / React
                      </button>
                      <button
                        onClick={() => setActiveTab('config')}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                          activeTab === 'config'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Nginx / WAF
                      </button>
                    </div>
                  </div>

                  <div className="relative rounded-lg overflow-hidden border border-[#1e293b] bg-[#090d16]">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b] bg-[#0d121f] text-[11px] font-mono text-slate-400">
                      <span>{activeTab === 'python' ? 'app/security/patch.py' : activeTab === 'javascript' ? 'src/controllers/safeHandler.js' : 'nginx/conf.d/security.conf'}</span>
                      <button
                        onClick={() => handleCopyCode(
                          activeTab === 'python' ? patch.python_patch : activeTab === 'javascript' ? patch.javascript_patch : patch.config_patch
                        )}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-mono transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Patch'}</span>
                      </button>
                    </div>

                    <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                      <code>
                        {activeTab === 'python' && patch.python_patch}
                        {activeTab === 'javascript' && patch.javascript_patch}
                        {activeTab === 'config' && patch.config_patch}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Prevention Checklist */}
                {patch.prevention_checklist && (
                  <div className="p-3.5 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Hardening & Prevention Checklist
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                      {patch.prevention_checklist.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1e293b] bg-[#0d121f] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Source: {patch?.source || 'VulnScan AI/ML Intelligence Core'}</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-200 border border-[#334155] transition-colors"
            >
              Close
            </button>
          </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

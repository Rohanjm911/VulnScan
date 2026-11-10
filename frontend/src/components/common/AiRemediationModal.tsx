import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  ShieldAlert, 
  AlertTriangle, 
  Code, 
  CheckCircle2, 
  Flame, 
  Clock, 
  FileCode,
  Layers,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface AiRemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding: {
    id?: number;
    title: string;
    category: string;
    severity: string;
    evidence?: string;
    target_url?: string;
  } | null;
}

export const AiRemediationModal: React.FC<AiRemediationModalProps> = ({
  isOpen,
  onClose,
  finding,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'python' | 'javascript' | 'config'>('python');
  const [copied, setCopied] = useState<boolean>(false);
  const { error: toastError, success: toastSuccess } = useToast();

  useEffect(() => {
    if (isOpen && finding) {
      fetchRemediation();
    } else {
      setData(null);
    }
  }, [isOpen, finding]);

  const fetchRemediation = async () => {
    if (!finding) return;
    try {
      setLoading(true);
      const res = await api.remediateFinding({
        finding_id: finding.id,
        title: finding.title,
        category: finding.category,
        severity: finding.severity,
        evidence: finding.evidence,
        target_url: finding.target_url,
      });
      setData(res);
    } catch (err: any) {
      toastError('AI Remediation Error', err.message || 'Failed to generate AI fix patch');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toastSuccess('Copied to Clipboard', 'Remediation code snippet ready to paste.');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !finding) return null;

  const patch = data?.remediation;
  const epss = data?.epss_threat_prediction;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#120C26] border border-purple-500/40 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#2E1E54] bg-[#160E30] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600/20 text-fuchsia-400 border border-purple-500/40 shadow-glow-synth">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-heading text-white tracking-wide">
                    AI Remediation & Patch Synthesizer
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-fuchsia-300 border border-purple-800/60 flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    HYBRID AI/ML
                  </span>
                </div>
                <p className="text-xs text-purple-300/70 font-mono truncate max-w-lg mt-0.5">
                  Target Finding: {finding.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#201545] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs font-sans">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-purple-300 font-mono text-xs">
                  Synthesizing multi-language security patches & calculating ML EPSS threat velocity...
                </p>
              </div>
            ) : patch ? (
              <>
                {/* ML Threat Prediction Bar */}
                {epss && (
                  <div className="p-3.5 rounded-xl bg-[#191138] border border-purple-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">
                          ML EPSS Exploitability
                        </span>
                        <span className="text-base font-bold font-mono text-red-400">
                          {epss.epss_percentage}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({epss.percentile})
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">
                          Remediation SLA
                        </span>
                        <span className="text-xs font-bold font-mono text-amber-300">
                          {epss.recommended_sla}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">
                          Threat Velocity Tier
                        </span>
                        <span className="text-xs font-bold font-mono text-purple-300">
                          {epss.velocity}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Root Cause & Summary */}
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-[#150F2C] border border-[#2E1E54]">
                    <span className="text-[10px] font-mono uppercase text-fuchsia-400 font-bold block mb-1">
                      Root Cause Analysis
                    </span>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      {patch.root_cause}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#150F2C] border border-[#2E1E54]">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                      Architectural Defense-in-Depth Fix
                    </span>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      {patch.fix_summary}
                    </p>
                  </div>
                </div>

                {/* Code Patches Tabs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-heading text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-fuchsia-400" />
                      <span>Production-Ready Code Patches</span>
                    </span>

                    <div className="flex items-center gap-1 bg-[#0F0A1E] p-1 rounded-lg border border-[#2E1E54]">
                      <button
                        onClick={() => setActiveTab('python')}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                          activeTab === 'python'
                            ? 'bg-purple-600 text-white shadow-glow-synth'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Python / FastAPI
                      </button>
                      <button
                        onClick={() => setActiveTab('javascript')}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                          activeTab === 'javascript'
                            ? 'bg-purple-600 text-white shadow-glow-synth'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Node.js / React
                      </button>
                      <button
                        onClick={() => setActiveTab('config')}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                          activeTab === 'config'
                            ? 'bg-purple-600 text-white shadow-glow-synth'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Nginx / WAF
                      </button>
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-[#2E1E54] bg-[#0A0614]">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-[#2E1E54] bg-[#110B22] text-[11px] font-mono text-slate-400">
                      <span>{activeTab === 'python' ? 'app/security/patch.py' : activeTab === 'javascript' ? 'src/controllers/safeHandler.js' : 'nginx/conf.d/security.conf'}</span>
                      <button
                        onClick={() => handleCopyCode(
                          activeTab === 'python' ? patch.python_patch : activeTab === 'javascript' ? patch.javascript_patch : patch.config_patch
                        )}
                        className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-mono transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Patch'}</span>
                      </button>
                    </div>

                    <pre className="p-4 text-xs font-mono text-purple-200 overflow-x-auto leading-relaxed">
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
                  <div className="p-4 rounded-xl bg-[#150F2C] border border-[#2E1E54] space-y-2">
                    <span className="text-[10px] font-mono uppercase text-purple-300 font-bold block">
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
          <div className="p-4 border-t border-[#2E1E54] bg-[#140D2B] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Source: {patch?.source || 'VulnScan AI/ML Intelligence Core'}</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#221747] hover:bg-[#2C1D59] text-white border border-[#2E1E54] transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


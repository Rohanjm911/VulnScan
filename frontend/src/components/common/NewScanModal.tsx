import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target } from '../../types';
import { api } from '../../api/client';
import { X, Play, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanStarted: (scanId: number) => void;
}

export const NewScanModal: React.FC<NewScanModalProps> = ({ isOpen, onClose, onScanStarted }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [scanType, setScanType] = useState<string>('FULL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getTargets().then((data) => {
        setTargets(data);
        if (data.length > 0 && !selectedTargetId) {
          setSelectedTargetId(data[0].id);
        }
      }).catch(err => setError(err.message));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedTarget = targets.find((t) => t.id === selectedTargetId);

  const handleStartScan = async () => {
    if (!selectedTargetId) return;
    setLoading(true);
    setError(null);

    try {
      const scan = await api.startScan(selectedTargetId, scanType);
      onScanStarted(scan.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate scan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl cyber-card bg-[#150E2A] border-purple-500/40 p-6 shadow-2xl text-slate-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#2E1E54]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/15 text-fuchsia-400 border border-purple-500/30">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-white">Launch Vulnerability Scan</h3>
              <p className="text-xs text-purple-300/70">Initiate non-destructive multi-stage security assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#201540] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 my-5">
          {/* Target Selection */}
          <div>
            <label className="block text-xs font-mono text-purple-300 uppercase mb-2">
              Select Authorized Target
            </label>
            {targets.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-center">
                <p className="text-xs text-slate-400 mb-2">No registered targets found in scope.</p>
                <p className="text-xs text-purple-400">Please add an authorized target first in Target Manager.</p>
              </div>
            ) : (
              <select
                value={selectedTargetId || ''}
                onChange={(e) => setSelectedTargetId(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-slate-200 text-sm focus:border-purple-400 focus:outline-none"
              >
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.url}) {t.is_authorized ? '✓ Authorized' : '⚠️ Unauthorized'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Authorization Indicator */}
          {selectedTarget && (
            <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              selectedTarget.is_authorized
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {selectedTarget.is_authorized ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {selectedTarget.is_authorized
                    ? 'Target Authorization Confirmed'
                    : 'Target Authorization Required'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {selectedTarget.is_authorized
                    ? (selectedTarget.authorization_notes || 'Confirmed ownership or written testing permission.')
                    : 'Backend security guard will block scanning on unverified targets.'}
                </p>
              </div>
            </div>
          )}

          {/* Scan Profile Selection */}
          <div>
            <label className="block text-xs font-mono text-purple-300 uppercase mb-2">
              Scan Profile & Engine Scope
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'FULL', name: 'Full Assessment', desc: 'Recon, Ports, SSL, Headers, DAST & CVE' },
                { id: 'QUICK', name: 'Quick Audit', desc: 'Headers, SSL & Tech Fingerprint' },
                { id: 'RECON', name: 'Reconnaissance', desc: 'DNS, Subdomains & Stack Detection' },
                { id: 'PORTS', name: 'Port Scanner', desc: 'Common Service Port Discovery' },
                { id: 'SSL', name: 'SSL / TLS Only', desc: 'Certificates & Protocol Handshakes' },
                { id: 'HEADERS', name: 'Security Headers', desc: 'CSP, HSTS, X-Frame & Policies' },
                { id: 'DAST', name: 'Safe DAST Probes', desc: 'Non-destructive SQLi & XSS Canaries' },
                { id: 'CVE', name: 'CVE Intelligence', desc: 'Correlate Detected Stack with CVEs' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setScanType(p.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    scanType === p.id
                      ? 'bg-purple-500/20 border-purple-400 text-white shadow-glow-synth'
                      : 'bg-[#0F0A1F] border-[#2E1E54] text-slate-400 hover:border-purple-500/40'
                  }`}
                >
                  <p className="font-semibold text-slate-200">{p.name}</p>
                  <p className="text-[10px] text-purple-300/70 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2E1E54]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#201540] text-slate-300 hover:bg-[#2B1D54] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartScan}
            disabled={loading || !selectedTarget || !selectedTarget.is_authorized}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
              !selectedTarget || !selectedTarget.is_authorized || loading
                ? 'bg-[#201540] text-slate-500 cursor-not-allowed border border-[#2E1E54]'
                : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow-synth'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {loading ? 'Initializing Scan...' : 'Start Assessment'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

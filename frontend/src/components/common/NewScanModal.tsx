import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, X, ShieldAlert, CheckCircle2, AlertTriangle, Crosshair } from 'lucide-react';
import { Target } from '../../types';
import { api } from '../../api/client';

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanStarted: (scanId: number) => void;
  initialTargetId?: number;
}

export const NewScanModal: React.FC<NewScanModalProps> = ({
  isOpen,
  onClose,
  onScanStarted,
  initialTargetId,
}) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<number | undefined>(initialTargetId);
  const [scanType, setScanType] = useState<string>('FULL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      api.getTargets()
        .then((data) => {
          setTargets(data);
          if (data.length > 0 && !selectedTargetId) {
            setSelectedTargetId(data[0].id);
          }
        })
        .catch(() => setError('Failed to load targets.'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedTarget = targets.find((t) => t.id === selectedTargetId);

  const handleStartScan = async () => {
    if (!selectedTargetId) {
      setError('Please select a target.');
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="relative w-full max-w-xl bg-[#111827] border border-[#1e293b] rounded-lg p-6 shadow-2xl text-slate-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Launch Vulnerability Scan</h3>
              <p className="text-xs text-slate-400">Initiate non-destructive multi-stage security assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 my-5">
          {/* Target Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Authorized Target
            </label>
            {targets.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#0d121f] border border-[#1e293b] text-center">
                <p className="text-xs text-slate-400 mb-1">No registered targets found in scope.</p>
                <p className="text-xs text-blue-400">Please add an authorized target first in Target Manager.</p>
              </div>
            ) : (
              <select
                value={selectedTargetId || ''}
                onChange={(e) => setSelectedTargetId(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0d121f] border border-[#1e293b] text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
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
                ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                : 'bg-red-950/30 border-red-800 text-red-400'
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
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
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    scanType === p.id
                      ? 'bg-blue-600/10 border-blue-500 text-white'
                      : 'bg-[#0d121f] border-[#1e293b] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <p className="font-medium text-slate-200">{p.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-[#1e293b] text-slate-300 hover:bg-[#334155] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartScan}
            disabled={loading || !selectedTarget || !selectedTarget.is_authorized}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-medium rounded-lg uppercase tracking-wider transition-colors ${
              !selectedTarget || !selectedTarget.is_authorized || loading
                ? 'bg-[#1e293b] text-slate-500 cursor-not-allowed border border-[#334155]'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
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

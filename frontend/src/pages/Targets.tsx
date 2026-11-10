import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target } from '../types';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { 
  Crosshair, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Play, 
  ExternalLink, 
  AlertTriangle,
  Globe,
  CheckCircle2,
  X,
  Edit2
} from 'lucide-react';

interface TargetsProps {
  onStartScanForTarget: (targetId: number) => void;
}

export const Targets: React.FC<TargetsProps> = ({ onStartScanForTarget }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError, info } = useToast();

  // Add Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authorizationNotes, setAuthorizationNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Form State
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAuthorized, setEditAuthorized] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const data = await api.getTargets();
      setTargets(data);
    } catch (err: any) {
      toastError('Fetch Error', err.message || 'Failed to fetch target inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setFormError('You must explicitly certify authorization & ownership before adding a target.');
      return;
    }
    setSubmitting(true);
    setFormError(null);

    try {
      await api.createTarget({
        name,
        url,
        is_authorized: isAuthorized,
        authorization_notes: authorizationNotes,
      });
      success('Target Registered', `Successfully added ${name} to authorized testing scope.`);
      setShowAddModal(false);
      setName('');
      setUrl('');
      setIsAuthorized(false);
      setAuthorizationNotes('');
      fetchTargets();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add target');
      toastError('Validation Failed', err.message || 'SSRF check or validation rejected the target.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (target: Target) => {
    setEditingTarget(target);
    setEditName(target.name);
    setEditNotes(target.authorization_notes || '');
    setEditAuthorized(target.is_authorized);
  };

  const handleUpdateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;
    setEditSubmitting(true);

    try {
      await api.updateTarget(editingTarget.id, {
        name: editName,
        authorization_notes: editNotes,
        is_authorized: editAuthorized,
      });
      success('Target Updated', `Updated settings for ${editName}.`);
      setEditingTarget(null);
      fetchTargets();
    } catch (err: any) {
      toastError('Update Error', err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteTarget = async (id: number, targetName: string) => {
    if (!confirm(`Are you sure you want to remove target "${targetName}"? All historical scans for this target will be removed.`)) {
      return;
    }
    try {
      await api.deleteTarget(id);
      info('Target Removed', `Target ${targetName} was deleted from scope.`);
      fetchTargets();
    } catch (err: any) {
      toastError('Deletion Error', err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 cyber-card">
        <div>
          <h2 className="text-base font-bold font-heading text-white flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-fuchsia-400" />
            <span>Authorized Scope & Target Inventory</span>
          </h2>
          <p className="text-xs text-purple-300/70 mt-1">
            Strict perimeter enforcement. Scans are permitted only against verified, allowlisted web assets with affirmative consent.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-synth transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Target Scope</span>
        </button>
      </div>

      {/* Target Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : targets.length === 0 ? (
        <div className="p-12 text-center cyber-card">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300 font-heading">No Target Assets In Scope</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Register your domain, web application or test environment with confirmed authorization to begin scanning.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-purple-500/15 text-fuchsia-300 border border-purple-500/30 text-xs font-semibold hover:bg-purple-500/25"
          >
            Register First Target
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.map((target) => (
            <div key={target.id} className="cyber-card p-5 flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-fuchsia-400 group-hover:border-purple-500/40 group-hover:bg-purple-500/15 transition-colors">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate max-w-[170px]">
                        {target.name}
                      </h4>
                      <span className="text-[10px] font-mono text-purple-400">TARGET #{target.id}</span>
                    </div>
                  </div>
                  {target.is_authorized ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Authorized
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/30">
                      <AlertTriangle className="w-3 h-3" />
                      Unconfirmed
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 my-3 p-3 rounded-lg bg-[#120D26] border border-[#2E1E54] text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>HOST:</span>
                    <span className="text-slate-200 font-semibold truncate max-w-[150px]">{target.host}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>IP ADDR:</span>
                    <span className="text-purple-300">{target.ip_address || 'Unresolved'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>POLICY:</span>
                    <span className="text-emerald-400 font-bold">Allowlisted</span>
                  </div>
                </div>

                {target.authorization_notes && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-2 mb-3">
                    "{target.authorization_notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2E1E54]">
                <a
                  href={target.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Visit Host</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(target)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-fuchsia-300 hover:bg-[#1D1438] transition-colors"
                    title="Edit Target Settings"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteTarget(target.id, target.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-[#1D1438] transition-colors"
                    title="Delete Target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onStartScanForTarget(target.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-fuchsia-300 border border-purple-500/30 text-xs font-bold transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Launch</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Target Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg cyber-card bg-[#140E29] border-purple-500/30 p-6 shadow-2xl text-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2E1E54] mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-fuchsia-400" />
                  <h3 className="text-base font-bold font-heading text-white">
                    Register Authorized Target Asset
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateTarget} className="space-y-4 text-xs">
                <div>
                  <label className="block text-purple-300 font-mono uppercase mb-1">Friendly Target Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Staging Web App"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-slate-200 focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-purple-300 font-mono uppercase mb-1">Target URL or Hostname</label>
                  <input
                    type="text"
                    required
                    placeholder="https://example.com or staging.internal"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-slate-200 focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-purple-300 font-mono uppercase mb-1">Scope & Authorization Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Authorized under internal test engagement ticket #SEC-402"
                    value={authorizationNotes}
                    onChange={(e) => setAuthorizationNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-slate-200 focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {/* Mandatory Authorization Checkbox */}
                <div className="p-3.5 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAuthorized}
                      onChange={(e) => setIsAuthorized(e.target.checked)}
                      className="mt-0.5 rounded border-[#2E1E54] text-purple-600 focus:ring-purple-400 w-4 h-4"
                    />
                    <span className="text-[11px] text-slate-300 leading-relaxed">
                      <strong className="text-white">Authorization & Legal Confirmation:</strong> I explicitly certify that I own this target or possess written, formal authorization to perform security audits against it.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2E1E54]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-[#201540] text-slate-300 hover:bg-[#2C1D58] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !isAuthorized}
                    className={`px-5 py-2 rounded-lg font-bold uppercase tracking-wider transition-all ${
                      !isAuthorized || submitting
                        ? 'bg-[#201540] text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-glow-synth'
                    }`}
                  >
                    {submitting ? 'Verifying SSRF...' : 'Register Scope'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Target Modal */}
      <AnimatePresence>
        {editingTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg cyber-card bg-[#140E29] border-purple-500/30 p-6 shadow-2xl text-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2E1E54] mb-4">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-fuchsia-400" />
                  <h3 className="text-base font-bold font-heading text-white">
                    Update Target Scope: {editingTarget.host}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingTarget(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateTarget} className="space-y-4 text-xs">
                <div>
                  <label className="block text-purple-300 font-mono uppercase mb-1">Friendly Target Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-slate-200 focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-purple-300 font-mono uppercase mb-1">Scope & Authorization Notes</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] text-slate-200 focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-[#0F0A1F] border border-[#2E1E54] space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAuthorized}
                      onChange={(e) => setEditAuthorized(e.target.checked)}
                      className="mt-0.5 rounded border-[#2E1E54] text-purple-600 focus:ring-purple-400 w-4 h-4"
                    />
                    <span className="text-[11px] text-slate-300">
                      Maintain Verified Ownership / Written Authorization Confirmation
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2E1E54]">
                  <button
                    type="button"
                    onClick={() => setEditingTarget(null)}
                    className="px-4 py-2 rounded-lg bg-[#201540] text-slate-300 hover:bg-[#2C1D58] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 rounded-lg font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-glow-synth transition-all"
                  >
                    {editSubmitting ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

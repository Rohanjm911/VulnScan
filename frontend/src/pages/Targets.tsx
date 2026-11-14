import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crosshair, 
  Plus, 
  Trash2, 
  Edit2, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  Play, 
  X,
  ExternalLink
} from 'lucide-react';
import { Target } from '../types';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

interface TargetsProps {
  onStartScanForTarget: (targetId: number) => void;
}

export const Targets: React.FC<TargetsProps> = ({ onStartScanForTarget }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);

  // Add Target Form State
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [authorizationNotes, setAuthorizationNotes] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Target Form State
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAuthorized, setEditAuthorized] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const data = await api.getTargets();
      setTargets(data);
    } catch (err: any) {
      toastError('Fetch Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isAuthorized) {
      setFormError('Affirmative authorization confirmation is required under policy.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createTarget({
        name,
        url,
        is_authorized: isAuthorized,
        authorization_notes: authorizationNotes,
      });
      success('Target Registered', `Added ${name} to security scope.`);
      setShowAddModal(false);
      setName('');
      setUrl('');
      setAuthorizationNotes('');
      setIsAuthorized(false);
      fetchTargets();
    } catch (err: any) {
      setFormError(err.message || 'Failed to register target.');
    } finally {
      setSubmitting(false);
    }
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
      toastError('Update Failed', err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteTarget = async (id: number, targetName: string) => {
    if (!confirm(`Are you sure you want to remove '${targetName}' from scope? Active scans will be interrupted.`)) {
      return;
    }

    try {
      await api.deleteTarget(id);
      success('Target Removed', `Scope '${targetName}' deleted.`);
      fetchTargets();
    } catch (err: any) {
      toastError('Delete Failed', err.message);
    }
  };

  const openEditModal = (target: Target) => {
    setEditingTarget(target);
    setEditName(target.name);
    setEditNotes(target.authorization_notes || '');
    setEditAuthorized(target.is_authorized);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#111827] border border-[#1e293b] rounded-lg">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-blue-400" />
            <span>Authorized Scope & Target Inventory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Strict perimeter enforcement. Scans are permitted only against verified, allowlisted web assets with affirmative consent.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs uppercase tracking-wider transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Target Scope</span>
        </button>
      </div>

      {/* Target Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : targets.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-[#1e293b] rounded-lg">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No Target Assets In Scope</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Register your domain, web application or test environment with confirmed authorization to begin scanning.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-200 border border-[#334155] text-xs font-medium"
          >
            Register First Target
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {targets.map((target, idx) => (
              <motion.div
                key={target.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="cyber-card p-5 flex flex-col justify-between"
              >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-lg bg-[#0d121f] border border-[#1e293b] text-blue-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate max-w-[170px]">
                        {target.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">TARGET #{target.id}</span>
                    </div>
                  </div>
                  {target.is_authorized ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Authorized
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono bg-red-950/40 text-red-400 border border-red-800">
                      <AlertTriangle className="w-3 h-3" />
                      Unconfirmed
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 my-3 p-3 rounded bg-[#0d121f] border border-[#1e293b] text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>HOST:</span>
                    <span className="text-slate-200 font-semibold truncate max-w-[150px]">{target.host}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>IP ADDR:</span>
                    <span className="text-slate-300">{target.ip_address || 'Unresolved'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>POLICY:</span>
                    <span className="text-emerald-400 font-medium">Allowlisted</span>
                  </div>
                </div>

                {target.authorization_notes && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-2 mb-3">
                    "{target.authorization_notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1e293b]">
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
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
                    title="Edit Target Settings"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteTarget(target.id, target.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-[#1e293b] transition-colors"
                    title="Delete Target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onStartScanForTarget(target.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-medium transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Launch</span>
                  </button>
                </div>
              </div>
            </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Target Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative w-full max-w-lg bg-[#111827] border border-[#1e293b] rounded-lg p-6 shadow-2xl text-slate-100 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">
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
                <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateTarget} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-mono uppercase mb-1">Friendly Target Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Staging Web App"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d121f] border border-[#1e293b] text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono uppercase mb-1">Target URL or Hostname</label>
                  <input
                    type="text"
                    required
                    placeholder="https://example.com or staging.internal"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d121f] border border-[#1e293b] text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono uppercase mb-1">Scope & Authorization Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Authorized under internal test engagement ticket #SEC-402"
                    value={authorizationNotes}
                    onChange={(e) => setAuthorizationNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d121f] border border-[#1e293b] text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Mandatory Authorization Checkbox */}
                <div className="p-3.5 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAuthorized}
                      onChange={(e) => setIsAuthorized(e.target.checked)}
                      className="mt-0.5 rounded border-[#1e293b] text-blue-600 focus:ring-blue-500 w-4 h-4 bg-[#111827]"
                    />
                    <span className="text-[11px] text-slate-300 leading-relaxed">
                      <strong className="text-white">Authorization & Legal Confirmation:</strong> I explicitly certify that I own this target or possess written, formal authorization to perform security audits against it.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e293b]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-[#1e293b] text-slate-300 hover:bg-[#334155] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !isAuthorized}
                    className={`px-5 py-2 rounded-lg font-medium uppercase tracking-wider transition-colors ${
                      !isAuthorized || submitting
                        ? 'bg-[#1e293b] text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setEditingTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative w-full max-w-lg bg-[#111827] border border-[#1e293b] rounded-lg p-6 shadow-2xl text-slate-100 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">
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
                  <label className="block text-slate-300 font-mono uppercase mb-1">Friendly Target Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d121f] border border-[#1e293b] text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono uppercase mb-1">Scope & Authorization Notes</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d121f] border border-[#1e293b] text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-[#0d121f] border border-[#1e293b] space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAuthorized}
                      onChange={(e) => setEditAuthorized(e.target.checked)}
                      className="mt-0.5 rounded border-[#1e293b] text-blue-600 focus:ring-blue-500 w-4 h-4 bg-[#111827]"
                    />
                    <span className="text-[11px] text-slate-300">
                      Maintain Verified Ownership / Written Authorization Confirmation
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e293b]">
                  <button
                    type="button"
                    onClick={() => setEditingTarget(null)}
                    className="px-4 py-2 rounded-lg bg-[#1e293b] text-slate-300 hover:bg-[#334155] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 rounded-lg font-medium uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white transition-colors"
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

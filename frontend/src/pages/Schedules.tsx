import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarClock, 
  Plus, 
  Trash2, 
  Bell, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Globe, 
  ToggleLeft, 
  ToggleRight,
  Radio,
  ExternalLink
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Target, ScheduleItem } from '../types';

export const Schedules: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedTargetId, setSelectedTargetId] = useState<number | ''>('');
  const [scanType, setScanType] = useState('FULL');
  const [frequency, setFrequency] = useState('DAILY');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookPlatform, setWebhookPlatform] = useState('DISCORD');
  const [saving, setSaving] = useState(false);

  // Webhook Test State
  const [testingWebhook, setTestingWebhook] = useState(false);

  const { success, error: toastError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedRes, targetRes] = await Promise.all([
        api.getSchedules(),
        api.getTargets()
      ]);
      setSchedules(schedRes);
      setTargets(targetRes);
      if (targetRes.length > 0 && selectedTargetId === '') {
        setSelectedTargetId(targetRes[0].id);
      }
    } catch (err: any) {
      toastError('Schedule Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId) {
      toastError('Validation Error', 'Please select a target for this schedule.');
      return;
    }

    setSaving(true);
    try {
      await api.createSchedule({
        target_id: Number(selectedTargetId),
        scan_type: scanType,
        frequency: frequency,
        webhook_url: webhookUrl.trim() || undefined,
        webhook_platform: webhookPlatform,
        is_active: true
      });
      success('Schedule Configured', `Recurring ${frequency.toLowerCase()} scan registered.`);
      setWebhookUrl('');
      await loadData();
    } catch (err: any) {
      toastError('Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await api.toggleSchedule(id);
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, is_active: res.is_active } : s));
      success('Schedule Updated', `Schedule status toggled to ${res.is_active ? 'Active' : 'Paused'}.`);
    } catch (err: any) {
      toastError('Toggle Failed', err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this recurring schedule?')) return;
    try {
      await api.deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      success('Schedule Deleted', 'Scan schedule was removed.');
    } catch (err: any) {
      toastError('Delete Failed', err.message);
    }
  };

  const handleTestPing = async () => {
    if (!webhookUrl.trim()) {
      toastError('Invalid URL', 'Please enter a webhook URL first.');
      return;
    }
    setTestingWebhook(true);
    try {
      const res = await api.testWebhook({
        webhook_url: webhookUrl.trim(),
        webhook_platform: webhookPlatform
      });
      if (res.success) {
        success('Webhook Verified', res.message);
      } else {
        toastError('Delivery Alert', res.message);
      }
    } catch (err: any) {
      toastError('Webhook Error', err.message);
    } finally {
      setTestingWebhook(false);
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
            <CalendarClock className="w-6 h-6 text-primary-400" />
            Scheduled Automated Scans & Webhook Alerts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure autonomous recurring vulnerability assessments and receive rich-formatted alert embeds directly to Discord, Slack, or generic SIEM webhooks.
          </p>
        </div>
      </div>

      {/* Creation Card */}
      <div className="bg-[#131722] border border-[#232936] rounded-xl p-5 shadow-lg">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-primary-400" />
          Create New Recurring Scan Schedule
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Environment
              </label>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(Number(e.target.value))}
                className="w-full bg-[#0d1017] border border-[#232936] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                required
              >
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.host})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Scan Profile
              </label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                className="w-full bg-[#0d1017] border border-[#232936] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 font-mono"
              >
                <option value="FULL">FULL (Recon, Ports, SSL, DAST, AI)</option>
                <option value="DAST">DAST Assessment (XSS, SQLi, Headers)</option>
                <option value="NETWORK">Network Surface (Ports & SSL)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Frequency Interval
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-[#0d1017] border border-[#232936] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="HOURLY">Hourly Automated Probe</option>
                <option value="DAILY">Daily Comprehensive Scan</option>
                <option value="WEEKLY">Weekly Deep Audit</option>
              </select>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="pt-2 border-t border-[#232936]">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              SecOps Webhook Integration (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <select
                  value={webhookPlatform}
                  onChange={(e) => setWebhookPlatform(e.target.value)}
                  className="w-full bg-[#0d1017] border border-[#232936] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="DISCORD">Discord (Rich Embed)</option>
                  <option value="SLACK">Slack (Block Kit)</option>
                  <option value="CUSTOM">Custom Webhook (JSON)</option>
                </select>
              </div>

              <div className="md:col-span-3 flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/services/..."
                  className="flex-1 bg-[#0d1017] border border-[#232936] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={testingWebhook || !webhookUrl}
                  className="px-4 py-2.5 rounded-lg bg-[#202738] hover:bg-[#283248] text-cyan-300 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {testingWebhook ? 'Pinging...' : 'Test Ping'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all shadow-md disabled:opacity-50"
            >
              <CalendarClock className="w-4 h-4" />
              {saving ? 'Registering Schedule...' : 'Save Scan Schedule'}
            </button>
          </div>
        </form>
      </div>

      {/* Schedules List */}
      <div className="bg-[#131722] border border-[#232936] rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[#232936] flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-400" />
            Configured Scan Schedules ({schedules.length})
          </h2>
        </div>

        {schedules.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <CalendarClock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-white">No Automated Schedules Configured</p>
            <p className="text-xs text-slate-500 mt-1">Create your first recurring scan above to automate continuous security posture testing.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#232936]">
            {schedules.map((s) => (
              <div key={s.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#181d2a] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-white">
                      {s.target_name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-primary-950 text-primary-300 border border-primary-800 text-xs font-semibold">
                      {s.scan_type}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#202738] text-cyan-300 text-xs font-mono">
                      {s.frequency}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono">
                    {s.target_url}
                  </p>

                  {s.webhook_url && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>{s.webhook_platform}:</span>
                      <span className="font-mono text-slate-500 truncate max-w-sm">
                        {s.webhook_url}
                      </span>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 mt-1">
                    Next run: {s.next_run_at ? new Date(s.next_run_at).toLocaleString() : 'Pending'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      s.is_active
                        ? 'border-emerald-800 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {s.is_active ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-400" /> Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-500" /> Paused
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-400 hover:bg-rose-900/60 transition-colors"
                    title="Delete Schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};


import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardStats } from '../types';
import { api } from '../api/client';
import { SecurityScoreGauge } from '../components/common/SecurityScoreGauge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { 
  Crosshair, 
  Activity, 
  ShieldAlert, 
  Bug, 
  ArrowUpRight, 
  Plus, 
  FileText,
  AlertOctagon,
  TrendingUp,
  ShieldCheck,
  Globe2,
  Sparkles,
  Search,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenNewScan: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenNewScan }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { error: toastError } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      toastError('Telemetry Connection Error', err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 8000);
    return () => clearInterval(interval);
  }, []);

  // Synthetic trend points based on recent scores
  const trendData = stats?.recent_scans && stats.recent_scans.length > 0
    ? [...stats.recent_scans].reverse().map((s, idx) => ({
        name: `Scan #${s.id}`,
        score: s.security_score,
      }))
    : [
        { name: 'Baseline', score: 85 },
        { name: 'Scan #1', score: 68 },
      ];

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Quick Action Command Strip */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#170E30] via-[#1E1340] to-[#170E30] border border-purple-500/30 shadow-glow-synth flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/15 text-fuchsia-400 border border-purple-500/35">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-white tracking-wide">
              AppSec Command Center
            </h3>
            <p className="text-xs text-purple-300/70">
              Active automated vulnerability intelligence & surface discovery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('targets')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#221747] hover:bg-[#2B1D59] text-purple-200 text-xs font-semibold border border-purple-500/40 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Add Target</span>
          </button>
          <button
            onClick={onOpenNewScan}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-glow-synth"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Launch Scan</span>
          </button>
        </div>
      </div>

      {/* Top Posture Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Security Score Card */}
        <div className="cyber-card p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Security Score
            </span>
            <p className="text-3xl font-black font-heading text-white mt-1">
              {stats?.overall_score || 100}
              <span className="text-xs font-mono font-normal text-slate-400"> / 100</span>
            </p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Posture Assessed</span>
            </p>
          </div>
          <SecurityScoreGauge score={stats?.overall_score || 100} size={84} />
        </div>

        {/* Total Targets */}
        <div className="cyber-card p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Authorized Targets
            </span>
            <p className="text-3xl font-black font-heading text-white mt-1">
              {stats?.total_targets || 0}
            </p>
            <button
              onClick={() => onNavigate('targets')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium mt-2 flex items-center gap-1"
            >
              <span>Scope Inventory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/25">
            <Crosshair className="w-6 h-6" />
          </div>
        </div>

        {/* Scans Executed */}
        <div className="cyber-card p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Scans Executed
            </span>
            <p className="text-3xl font-black font-heading text-white mt-1">
              {stats?.completed_scans || 0}
            </p>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
              <span>{stats?.running_scans || 0} active currently</span>
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/25">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Total Findings */}
        <div className="cyber-card p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Vulnerabilities
            </span>
            <p className="text-3xl font-black font-heading text-white mt-1">
              {stats?.total_findings || 0}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-red-400 font-mono">
                {stats?.critical_count || 0} Critical
              </span>
              <span className="text-xs font-semibold text-orange-400 font-mono">
                {stats?.high_count || 0} High
              </span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution */}
        <div className="cyber-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
                Vulnerability Severity Breakdown
              </h3>
              <p className="text-xs text-slate-400">Classified by CVSS threat severity</p>
            </div>
            <button
              onClick={() => onNavigate('vulns')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
            >
              <span>View Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.severity_distribution || []}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#160F2E',
                    borderColor: '#2E1E54',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC'
                  }}
                  cursor={{ fill: 'rgba(192, 132, 252, 0.05)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats?.severity_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Score Trend Area Chart */}
        <div className="cyber-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Posture Trajectory</span>
            </h3>
            <p className="text-xs text-slate-400">Security score progression across scans</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C084FC" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C084FC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#160F2E',
                    borderColor: '#2E1E54',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#C084FC" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="cyber-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
              Recent Security Assessments
            </h3>
            <p className="text-xs text-slate-400">Telemetry logs from automated security runs</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
          >
            <span>All History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {(!stats?.recent_scans || stats.recent_scans.length === 0) ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            No scans recorded yet. Add an authorized target and initiate a scan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2E1E54] text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 px-3">Target Scope</th>
                  <th className="pb-3 px-3">Scan Type</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Current Stage</th>
                  <th className="pb-3 px-3">Security Score</th>
                  <th className="pb-3 px-3">Executed At</th>
                  <th className="pb-3 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E1E54]/60 font-sans">
                {stats.recent_scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#1A1136]/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{scan.target_name}</div>
                      <div className="text-[11px] text-purple-300/70 font-mono truncate max-w-[200px]">{scan.target_url}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30 text-[10px]">
                        {scan.scan_type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={scan.status} />
                    </td>
                    <td className="py-3 px-3 text-slate-400 max-w-[180px] truncate">
                      {scan.current_stage}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-mono font-bold ${
                        scan.security_score >= 80 ? 'text-emerald-400' :
                        scan.security_score >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {scan.security_score} / 100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {scan.started_at ? scan.started_at.substring(0, 16).replace('T', ' ') : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('history')}
                        className="text-purple-400 hover:text-purple-300 font-mono text-xs hover:underline"
                      >
                        Telemetry →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

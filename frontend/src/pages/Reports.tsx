import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Scan } from '../types';
import { useToast } from '../context/ToastContext';
import { FileText, Download, CheckCircle, Clock, ShieldCheck, HardDrive, Plus, Sparkles } from 'lucide-react';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { success, error: toastError } = useToast();

  const handleGenerateAiSummary = async () => {
    try {
      setAiLoading(true);
      const res = await api.getExecutiveSummary();
      setAiSummary(res);
      success('AI Narrative Generated', 'CISO executive assessment synthesized.');
    } catch (err: any) {
      toastError('AI Error', err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchReportsAndScans = async () => {
    try {
      setLoading(true);
      const [reps, scanList] = await Promise.all([
        api.getReports(),
        api.getScans()
      ]);
      setReports(reps);
      setScans(scanList);
      if (scanList.length > 0) {
        setSelectedScanId(scanList[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsAndScans();
  }, []);

  const handleGeneratePdf = () => {
    if (!selectedScanId) return;
    const downloadUrl = api.generateReportForScanUrl(selectedScanId);
    window.open(downloadUrl, '_blank');
    success('Compiling PDF Report', `Generating comprehensive PDF audit report for Scan #${selectedScanId}`);
    setTimeout(() => {
      api.getReports().then(setReports);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* On-Demand Report Compiler Strip */}
      <div className="cyber-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold font-heading text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-fuchsia-400" />
              <span>Automated PDF Security Assessment Reports</span>
            </h2>
            <p className="text-xs text-purple-300/70 mt-1">
              Executive-level summaries, compliance evidence tables, and step-by-step remediation plans compiled with ReportLab.
            </p>
          </div>
          <button
            onClick={fetchReportsAndScans}
            className="px-4 py-2 rounded-lg bg-[#140E29] border border-[#2E1E54] text-xs text-purple-200 hover:text-white hover:border-purple-500/40 transition-colors"
          >
            Refresh Archive
          </button>
        </div>

        {/* Generate for Scan Bar */}
        {scans.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#0F0A1F] border border-[#2E1E54] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-purple-300">Generate Report for Run:</span>
              <select
                value={selectedScanId || ''}
                onChange={(e) => setSelectedScanId(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded bg-[#160E2E] border border-[#2E1E54] text-purple-200 text-xs focus:border-purple-400 focus:outline-none"
              >
                {scans.map((s) => (
                  <option key={s.id} value={s.id}>
                    Scan #{s.id} ({s.scan_type}) - Score: {s.security_score}/100 [{s.status}]
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGeneratePdf}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-synth transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Compile & Download PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* AI CISO Executive Threat Narrative */}
      <div className="cyber-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
            <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
              AI Executive Threat Narrative
            </h3>
          </div>
          <button
            onClick={handleGenerateAiSummary}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#201545] hover:bg-[#2B1D5C] text-fuchsia-300 border border-purple-500/40 text-xs font-mono transition-colors"
          >
            {aiLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{aiSummary ? 'Regenerate Narrative' : 'Synthesize AI Executive Summary'}</span>
          </button>
        </div>

        {aiSummary ? (
          <div className="p-4 rounded-xl bg-[#140D2A] border border-purple-500/30 space-y-3 text-xs leading-relaxed">
            <p className="text-slate-200">{aiSummary.executive_narrative}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#2E1E54] font-mono text-[11px]">
              <span className="text-red-400">{aiSummary.critical_count} Critical Threats</span>
              <span>•</span>
              <span className="text-orange-400">{aiSummary.high_count} High Severity Weaknesses</span>
              <span>•</span>
              <span className="text-purple-300">Model: {aiSummary.source}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-sans">
            Click "Synthesize AI Executive Summary" to automatically aggregate all posture telemetry into an audit-ready executive narrative suitable for compliance and leadership briefings.
          </p>
        )}
      </div>

      {/* Reports Archive Table */}
      <div className="cyber-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
            Generated Report Archive
          </h3>
          <span className="text-xs font-mono text-purple-400">{reports.length} Reports Saved</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            No PDF reports generated yet. Click "Compile & Download PDF" above or run a scan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#2E1E54] text-slate-400 font-mono text-[10px] uppercase">
                  <th className="pb-3 px-3">Report Document</th>
                  <th className="pb-3 px-3">File Size</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E1E54]/60 font-mono">
                {reports.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#1A1136]/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-200">{r.filename}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {(r.size_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Archived
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <a
                        href={api.getReportDownloadUrl(r.filename)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-fuchsia-300 border border-purple-500/30 text-xs font-bold transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
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

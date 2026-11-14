import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  ShieldCheck, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight,
  Shield,
  FileCheck2,
  Lock
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { ComplianceMatrixResult, Target } from '../types';

export const ComplianceMatrix: React.FC = () => {
  const [matrix, setMatrix] = useState<ComplianceMatrixResult | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [expandedFw, setExpandedFw] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const loadData = async (targetId?: number) => {
    try {
      setLoading(true);
      const [matrixRes, targetsRes] = await Promise.all([
        api.getComplianceMatrix(targetId),
        targets.length === 0 ? api.getTargets() : Promise.resolve(targets)
      ]);
      setMatrix(matrixRes);
      if (targets.length === 0) setTargets(targetsRes);
    } catch (err: any) {
      toastError('Compliance Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedTargetId === '' ? undefined : Number(selectedTargetId));
  }, [selectedTargetId]);

  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTargetId(val === '' ? '' : Number(val));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CERTIFIED_READY':
      case 'COMPLIANT':
        return 'text-emerald-400 border-emerald-800 bg-emerald-950/60';
      case 'REMEDIATION_REQUIRED':
      case 'AT_RISK':
        return 'text-amber-400 border-amber-800 bg-amber-950/60';
      case 'FAILING':
      case 'NON_COMPLIANT':
      default:
        return 'text-rose-400 border-rose-800 bg-rose-950/60';
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
            <Award className="w-6 h-6 text-primary-400" />
            Compliance Auditor & Benchmark Matrix
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated alignment of active DAST findings against SOC 2 Type II, ISO/IEC 27001, PCI-DSS v4.0, and HIPAA.
          </p>
        </div>

        {/* Target Filter */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Scope:</label>
          <select
            value={selectedTargetId}
            onChange={handleTargetChange}
            className="bg-[#131722] border border-[#232936] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 font-mono"
          >
            <option value="">Global Assessment (All Targets)</option>
            {targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.host})
              </option>
            ))}
          </select>
          <button
            onClick={() => loadData(selectedTargetId === '' ? undefined : Number(selectedTargetId))}
            className="p-2 rounded-lg bg-[#131722] border border-[#232936] text-slate-300 hover:text-white"
            title="Refresh Matrix"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Framework Summary Cards */}
      {matrix && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {matrix.frameworks.map((fw) => {
            const isPassing = fw.compliance_score >= 80;
            return (
              <div
                key={fw.framework}
                className="bg-[#131722] border border-[#232936] rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Standard
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(fw.overall_status)}`}>
                      {fw.overall_status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {fw.framework}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {fw.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#232936]">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Readiness Score</span>
                    <span className={`text-2xl font-bold ${
                      fw.compliance_score >= 80 ? 'text-emerald-400' : fw.compliance_score >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {fw.compliance_score}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#0d1017] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        fw.compliance_score >= 80 ? 'bg-emerald-500' : fw.compliance_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${fw.compliance_score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>Passed Controls</span>
                    <span className="font-mono font-bold text-slate-200">
                      {fw.passed_controls} / {fw.total_controls}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Controls Breakdown Accordion */}
      {matrix && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary-400" />
            Framework Security Controls Audit
          </h2>

          <div className="space-y-3">
            {matrix.frameworks.map((fw) => {
              const isExpanded = expandedFw === fw.framework;
              return (
                <div
                  key={fw.framework}
                  className="bg-[#131722] border border-[#232936] rounded-xl overflow-hidden shadow-lg"
                >
                  <button
                    onClick={() => setExpandedFw(isExpanded ? null : fw.framework)}
                    className="w-full p-4 flex items-center justify-between bg-[#131722] hover:bg-[#181d2a] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-primary-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <span className="text-base font-bold text-white">{fw.framework}</span>
                        <span className="text-xs text-slate-400 ml-3">
                          {fw.passed_controls} of {fw.total_controls} Controls Satisfied
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded border uppercase ${getStatusColor(fw.overall_status)}`}>
                      {fw.compliance_score}% READY
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#232936] divide-y divide-[#232936]">
                      {fw.controls.map((ctrl) => (
                        <div key={ctrl.id} className="p-4 hover:bg-[#161a26] transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 rounded bg-[#202738] text-xs font-mono font-bold text-cyan-300">
                                {ctrl.id}
                              </span>
                              <span className="text-sm font-semibold text-white">
                                {ctrl.name}
                              </span>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getStatusColor(ctrl.status)}`}>
                              {ctrl.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 mt-2">
                            {ctrl.requirement}
                          </p>

                          {ctrl.violations_count > 0 && (
                            <div className="mt-3 p-3 rounded-lg bg-[#0d1017] border border-rose-950/60">
                              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-1.5">
                                <AlertOctagon className="w-3.5 h-3.5" /> Failing Vulnerability Violations ({ctrl.violations_count})
                              </span>
                              <div className="space-y-1">
                                {ctrl.violating_findings.map((vf) => (
                                  <div key={vf.id} className="text-xs font-mono text-slate-300 flex items-center justify-between">
                                    <span>• {vf.title}</span>
                                    <span className="text-rose-400 font-bold ml-2">[{vf.severity}]</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};


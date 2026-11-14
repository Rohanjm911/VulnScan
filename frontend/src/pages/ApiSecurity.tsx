import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCode, 
  Search, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Terminal, 
  Lock, 
  Layers, 
  Key,
  Globe,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { ApiAuditResult } from '../types';

export const ApiSecurity: React.FC = () => {
  const [tab, setTab] = useState<'url' | 'raw'>('url');
  const [targetUrl, setTargetUrl] = useState('https://petstore.swagger.io/v2/swagger.json');
  const [rawJson, setRawJson] = useState(`{
  "openapi": "3.0.0",
  "info": { "title": "Customer Core API", "version": "1.0.0" },
  "paths": {
    "/users/{user_id}/billing": {
      "get": {
        "summary": "Fetch billing details",
        "parameters": [
          { "name": "user_id", "in": "path", "required": true },
          { "name": "api_key", "in": "query", "required": true }
        ]
      }
    },
    "/admin/export": {
      "get": {
        "summary": "Full export of customer records",
        "parameters": []
      }
    }
  }
}`);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiAuditResult | null>(null);

  const { success, error: toastError } = useToast();

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = tab === 'url' ? { target_url: targetUrl } : { spec_json: rawJson };
      const res = await api.auditApiSecurity(payload);
      setResult(res);
      success(
        'Audit Completed',
        `Evaluated ${res.endpoints_audited} endpoints. Found ${res.findings.length} security concern(s).`
      );
    } catch (err: any) {
      toastError('Audit Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#232936]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCode className="w-6 h-6 text-primary-400" />
            API Security & OpenAPI Auditor
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            OWASP API Security Top 10 static & runtime audit for BOLA/IDOR, broken authorization, and query parameter leaks.
          </p>
        </div>
      </div>

      {/* Mode Switcher & Input Card */}
      <div className="bg-[#131722] border border-[#232936] rounded-xl p-5 shadow-lg">
        <div className="flex gap-4 border-b border-[#232936] pb-3 mb-4">
          <button
            onClick={() => setTab('url')}
            className={`flex items-center gap-2 text-sm font-medium pb-2 border-b-2 transition-colors ${
              tab === 'url'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            Live Spec / Endpoint URL
          </button>
          <button
            onClick={() => setTab('raw')}
            className={`flex items-center gap-2 text-sm font-medium pb-2 border-b-2 transition-colors ${
              tab === 'raw'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Paste OpenAPI JSON Schema
          </button>
        </div>

        <form onSubmit={handleAudit} className="space-y-4">
          {tab === 'url' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Swagger / OpenAPI Endpoint URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://api.domain.com/v3/api-docs or https://api.domain.com/swagger.json"
                  className="w-full bg-[#0d1017] border border-[#232936] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Supports auto-discovery across standard OpenAPI endpoints (/openapi.json, /swagger.json, /v3/api-docs).
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Raw OpenAPI / Swagger JSON Specification
              </label>
              <textarea
                rows={8}
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                className="w-full bg-[#0d1017] border border-[#232936] rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-primary-500"
                required
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <UploadCloud className="w-4 h-4 animate-spin" />
                  Auditing API Specification...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  Run API Security Audit
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Audit Results */}
      {result && (
        <div className="space-y-6">
          {/* Executive KPI Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">API Score</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-3xl font-bold ${
                  result.security_score >= 80 ? 'text-emerald-400' : result.security_score >= 50 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {result.security_score}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>

            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Endpoints Analyzed</span>
              <div className="text-3xl font-bold text-white mt-2">
                {result.endpoints_audited}
              </div>
            </div>

            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> BOLA / IDOR Candidates
              </span>
              <div className="text-3xl font-bold text-rose-400 mt-2">
                {result.bola_candidates}
              </div>
            </div>

            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Unauthenticated Routes
              </span>
              <div className="text-3xl font-bold text-amber-400 mt-2">
                {result.unauthenticated_endpoints}
              </div>
            </div>

            <div className="bg-[#131722] border border-[#232936] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Missing Pagination
              </span>
              <div className="text-3xl font-bold text-blue-400 mt-2">
                {result.missing_pagination}
              </div>
            </div>
          </div>

          {/* Findings List */}
          <div className="bg-[#131722] border border-[#232936] rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-[#232936] flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary-400" />
                Vulnerability Breakdown ({result.findings.length})
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {result.api_title} v{result.api_version}
              </span>
            </div>

            {result.findings.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-white">No Critical API Vulnerabilities Identified</p>
                <p className="text-xs text-slate-500 mt-1">All scanned endpoints enforce authentication and pagination requirements.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#232936]">
                {result.findings.map((f, i) => (
                  <div key={i} className="p-5 hover:bg-[#181d2a] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <SeverityBadge severity={f.severity} />
                        <span className="px-2 py-0.5 rounded bg-[#202738] text-xs font-mono font-bold text-cyan-400">
                          {f.method}
                        </span>
                        <span className="text-sm font-bold text-white font-mono">
                          {f.endpoint}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {f.owasp}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-200 mt-2">
                      {f.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {f.description}
                    </p>

                    <div className="mt-3 p-3 rounded-lg bg-[#0d1017] border border-[#232936]">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Remediation Recommendation
                      </span>
                      <p className="text-xs text-slate-300 font-mono">
                        {f.remediation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};


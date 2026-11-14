import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Code, 
  Flame, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  RotateCcw,
  Sliders,
  Cpu,
  Layers,
  Terminal,
  Activity,
  ArrowRight
} from 'lucide-react';

export const AiCopilot: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'chat' | 'sast' | 'epss' | 'mutator'>('chat');
  const { error: toastError, success: toastSuccess } = useToast();

  // --- Module 1: Copilot Chat State ---
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string; model?: string }>>([
    {
      sender: 'ai',
      text: "Hello, SecOps Analyst. I am the VulnScan AI Intelligence Copilot powered by hybrid machine learning and heuristic security engines. How can I assist you with your vulnerability triage, attack surface analysis, or secure coding today?",
      time: 'Ready',
      model: 'Hybrid AI/ML Core'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendChat = async (questionText?: string) => {
    const q = questionText || inputQuestion;
    if (!q.trim()) return;

    const userMsg = { sender: 'user' as const, text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInputQuestion('');
    setChatLoading(true);

    try {
      const res = await api.copilotChat({ question: q });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: res.model
        }
      ]);
    } catch (err: any) {
      toastError('Copilot Error', err.message || 'Failed to reach AI Copilot');
    } finally {
      setChatLoading(false);
    }
  };

  // --- Module 2: Code SAST Auditor State ---
  const [sampleCode, setSampleCode] = useState(
`import os
import sqlite3

def login_user(username, password):
    # Dynamic SQL concatenation
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE user = '{username}' AND pass = '{password}'"
    cursor.execute(query)
    
    # Insecure shell command
    os.system(f"echo Login attempt: {username}")
    
    return cursor.fetchone()`
  );
  const [sastLoading, setSastLoading] = useState(false);
  const [sastResult, setSastResult] = useState<any>(null);

  const handleAuditCode = async () => {
    if (!sampleCode.trim()) return;
    try {
      setSastLoading(true);
      const res = await api.auditCode({ code: sampleCode, language: 'python' });
      setSastResult(res);
      toastSuccess('SAST Scan Complete', `Identified ${res.vulnerabilities_detected.length} security findings.`);
    } catch (err: any) {
      toastError('Audit Error', err.message);
    } finally {
      setSastLoading(false);
    }
  };

  // --- Module 3: ML EPSS Threat Predictor State ---
  const [cvss, setCvss] = useState<number>(8.8);
  const [category, setCategory] = useState<string>('SQL Injection');
  const [hasPoc, setHasPoc] = useState<boolean>(true);
  const [isRemote, setIsRemote] = useState<boolean>(true);
  const [requiresAuth, setRequiresAuth] = useState<boolean>(false);
  const [epssResult, setEpssResult] = useState<any>(null);
  const [epssLoading, setEpssLoading] = useState<boolean>(false);

  const handlePredictEpss = async () => {
    try {
      setEpssLoading(true);
      const res = await api.predictEpss({
        cvss_score: cvss,
        category: category,
        has_poc: hasPoc,
        is_remote: isRemote,
        requires_auth: requiresAuth
      });
      setEpssResult(res);
    } catch (err: any) {
      toastError('Prediction Error', err.message);
    } finally {
      setEpssLoading(false);
    }
  };

  useEffect(() => {
    handlePredictEpss();
  }, [cvss, category, hasPoc, isRemote, requiresAuth]);

  // --- Module 4: Payload Mutator State ---
  const [mutatorType, setMutatorType] = useState<string>('sqli');
  const [mutations, setMutations] = useState<any[]>([]);
  const [mutatorLoading, setMutatorLoading] = useState<boolean>(false);

  const handleFetchMutations = async (type: string) => {
    try {
      setMutatorLoading(true);
      setMutatorType(type);
      const res = await api.mutatePayloads({ payload_type: type });
      setMutations(res.mutations || []);
    } catch (err: any) {
      toastError('Mutator Error', err.message);
    } finally {
      setMutatorLoading(false);
    }
  };

  useEffect(() => {
    handleFetchMutations('sqli');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Banner Header */}
      <div className="cyber-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-heading text-white tracking-wide">
                AI / ML Cybersecurity Intelligence Center
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Machine Learning Exploit Prediction (EPSS), Adaptive Payload Mutation, Code SAST, & SecOps Copilot
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-[#131722] p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveModule('chat')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeModule === 'chat'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SecOps Copilot</span>
          </button>

          <button
            onClick={() => setActiveModule('sast')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeModule === 'sast'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>AI Code Auditor</span>
          </button>

          <button
            onClick={() => setActiveModule('epss')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeModule === 'epss'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>ML EPSS Predictor</span>
          </button>

          <button
            onClick={() => setActiveModule('mutator')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeModule === 'mutator'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>WAF Mutator</span>
          </button>
        </div>
      </div>

      {/* Module 1: SecOps Copilot Chat */}
      {activeModule === 'chat' && (
        <div className="cyber-card p-5 flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-xs uppercase font-heading text-white">
                Conversational SecOps Intelligence
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Live Threat Triage & Architecture Guidance
            </span>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs font-sans">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-xl p-3.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#131722] border border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-700/50 text-[10px] font-mono text-slate-400">
                    <span>{m.model || 'Analyst'}</span>
                    <span>{m.time}</span>
                  </div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2 items-center text-xs text-blue-400 font-mono">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>AI SecOps Copilot reasoning...</span>
              </div>
            )}
          </div>

          {/* Suggested Prompts */}
          <div className="py-2.5 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
            <span className="text-slate-500 text-[10px] shrink-0">QUICK ASKS:</span>
            {[
              "How to remediate SQL Injection in FastAPI?",
              "What is EPSS vs CVSS?",
              "Generate strict CSP for React app",
              "Explain Blind SQLi timing attacks"
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(prompt)}
                className="px-2.5 py-1 rounded bg-[#131722] hover:bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="pt-3 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask anything about vulnerabilities, CVEs, attack vectors, or code fixes..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#131722] border border-slate-700 focus:border-blue-500 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={chatLoading || !inputQuestion.trim()}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}

      {/* Module 2: Code SAST Auditor */}
      {activeModule === 'sast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="cyber-card p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="font-bold text-xs font-heading uppercase text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span>Source Code Under Audit</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Python / Node / SQL</span>
            </div>

            <textarea
              rows={16}
              value={sampleCode}
              onChange={(e) => setSampleCode(e.target.value)}
              className="w-full flex-1 p-3.5 rounded-lg bg-[#0b0f19] border border-slate-800 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none leading-relaxed resize-none"
              placeholder="Paste code snippet to audit for OWASP Top 10 vulnerabilities..."
            />

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSampleCode(
`# Sample 2: Reflected XSS & Auth Bypass
def render_profile(req):
    user_input = req.args.get('bio')
    # Unescaped reflection
    return f"<html><body><h1>User Bio</h1>{user_input}</body></html>"`
                )}
                className="text-xs text-blue-400 hover:underline font-mono"
              >
                Load XSS Sample
              </button>

              <button
                type="button"
                onClick={handleAuditCode}
                disabled={sastLoading}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                {sastLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Scan Code with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="cyber-card p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="font-bold text-xs font-heading uppercase text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SAST Findings & Refactored Fix</span>
              </span>
              {sastResult && (
                <span className="text-xs font-mono font-bold text-blue-400">
                  Security Score: {sastResult.score} / 100
                </span>
              )}
            </div>

            {sastResult ? (
              <div className="space-y-4 overflow-y-auto max-h-[500px] text-xs">
                <div className="p-3 rounded-lg bg-[#131722] border border-slate-800 text-slate-300">
                  {sastResult.summary}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                    Vulnerabilities Detected ({sastResult.vulnerabilities_detected.length})
                  </span>
                  {sastResult.vulnerabilities_detected.map((v: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#131722] border border-red-500/20 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 font-mono text-[9px] font-bold">
                            {v.severity}
                          </span>
                          <span className="font-semibold text-slate-100">{v.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{v.description}</p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        Line {v.line}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">
                    Secure Refactored Code
                  </span>
                  <pre className="p-3.5 rounded-lg bg-[#0b0f19] border border-slate-800 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                    <code>{sastResult.secure_refactored_code}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
                <Code className="w-10 h-10 text-slate-600" />
                <p className="text-xs font-mono">
                  Paste or select a code snippet on the left and click "Scan Code with AI" to identify security flaws.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Module 3: ML EPSS Threat Predictor */}
      {activeModule === 'epss' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="cyber-card p-5 lg:col-span-1 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-bold text-xs font-heading uppercase text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Feature Vector Parameters</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Calibrated machine learning threat model inputs
              </p>
            </div>

            {/* CVSS Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">CVSS Base Score</span>
                <span className="font-mono font-bold text-blue-400">{cvss.toFixed(1)} / 10.0</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="10.0"
                step="0.1"
                value={cvss}
                onChange={(e) => setCvss(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium block">
                Vulnerability Class
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#131722] border border-slate-700 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="SQL Injection">SQL Injection (CWE-89)</option>
                <option value="Remote Code Execution">Remote Code Execution (CWE-78/94)</option>
                <option value="Cross-Site Scripting">Cross-Site Scripting (CWE-79)</option>
                <option value="SSL Weak Cipher">SSL / TLS Cryptographic Weakness</option>
                <option value="Missing Security Headers">Missing Defense Headers</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPoc}
                  onChange={(e) => setHasPoc(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-blue-400 w-4 h-4"
                />
                <span className="text-slate-300">Public Weaponized PoC Available</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-blue-400 w-4 h-4"
                />
                <span className="text-slate-300">Remotely Accessible Network Surface</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresAuth}
                  onChange={(e) => setRequiresAuth(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-blue-400 w-4 h-4"
                />
                <span className="text-slate-300">Requires Valid Authentication Credentials</span>
              </label>
            </div>
          </div>

          <div className="cyber-card p-5 lg:col-span-2 space-y-5">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-xs font-heading uppercase text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400" />
                <span>ML EPSS Exploitability Scorecard</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                EPSS v3 MODEL
              </span>
            </div>

            {epssResult && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#131722] border border-red-500/20">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Exploitation Probability
                    </span>
                    <p className="text-3xl font-black font-heading text-red-400 mt-1">
                      {epssResult.epss_percentage}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {epssResult.percentile} of all known CVEs
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#131722] border border-amber-500/20">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Recommended SLA
                    </span>
                    <p className="text-base font-bold font-mono text-amber-300 mt-1">
                      {epssResult.recommended_sla}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Target resolution deadline
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#131722] border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Threat Velocity Tier
                    </span>
                    <p className="text-base font-bold font-mono text-blue-400 mt-1">
                      {epssResult.tier}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {epssResult.velocity}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#131722] border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
                  <span className="font-bold font-mono text-white block">
                    AI Threat Intelligence Interpretation:
                  </span>
                  <p>
                    Based on calibrated empirical EPSS threat distributions, vulnerabilities matching this profile exhibit{' '}
                    <strong className="text-blue-400">{epssResult.epss_percentage} likelihood of in-the-wild exploitation</strong> within 30 days.
                    Because this asset involves {isRemote ? 'unrestricted remote network ingress' : 'local access'}{' '}
                    and {hasPoc ? 'publicly accessible weaponized exploits exist' : 'no verified weaponized exploit is currently published'},
                    security teams must prioritize mitigation according to SLA window: <strong className="text-amber-300">{epssResult.recommended_sla}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Module 4: WAF Payload Mutator */}
      {activeModule === 'mutator' && (
        <div className="cyber-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-xs font-heading uppercase text-white">
                Adaptive WAF & Filter Bypass Payload Mutator
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleFetchMutations('sqli')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                  mutatorType === 'sqli' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                SQL Injection
              </button>
              <button
                onClick={() => handleFetchMutations('xss')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                  mutatorType === 'xss' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cross-Site Scripting
              </button>
              <button
                onClick={() => handleFetchMutations('traversal')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                  mutatorType === 'traversal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Traversal / Headers
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mutations.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#131722] border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5 text-xs font-sans"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{m.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {m.technique}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0b0f19] border border-slate-800 font-mono text-blue-300 text-xs flex items-center justify-between">
                  <span className="truncate">{m.payload}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(m.payload);
                      toastSuccess('Payload Copied', m.payload);
                    }}
                    className="p-1 hover:text-white text-slate-400 ml-2 shrink-0"
                    title="Copy Payload"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">WAF Evasion Mechanism:</strong> {m.waf_bypass}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};


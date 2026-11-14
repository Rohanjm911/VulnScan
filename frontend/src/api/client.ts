import { 
  DashboardStats, 
  Target, 
  Scan, 
  Finding, 
  CveItem,
  ApiAuditResult,
  CloudReconResult,
  ComplianceMatrixResult,
  SecretScanResult,
  ScheduleItem,
  ScheduleCreateData
} from '../types';

const API_BASE = '/api/v1';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Dashboard
  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),

  // Targets
  getTargets: () => request<Target[]>('/targets'),
  createTarget: (data: { name: string; url: string; is_authorized: boolean; authorization_notes?: string }) =>
    request<Target>('/targets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTarget: (id: number, data: { name?: string; authorization_notes?: string; is_authorized?: boolean }) =>
    request<Target>(`/targets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTarget: (id: number) => request<void>(`/targets/${id}`, { method: 'DELETE' }),

  // Scans
  getScans: () => request<Scan[]>('/scans'),
  startScan: (targetId: number, scanType: string = 'FULL') =>
    request<Scan>('/scans', {
      method: 'POST',
      body: JSON.stringify({ target_id: targetId, scan_type: scanType }),
    }),
  getScanDetail: (id: number) => request<Scan>(`/scans/${id}`),
  cancelScan: (id: number) => request<{ message: string }>(`/scans/${id}/cancel`, { method: 'POST' }),

  // Findings
  getFindings: (params?: { severity?: string; category?: string; target_id?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.severity) q.append('severity', params.severity);
    if (params?.category) q.append('category', params.category);
    if (params?.target_id) q.append('target_id', params.target_id.toString());
    if (params?.search) q.append('search', params.search);
    return request<Finding[]>(`/findings?${q.toString()}`);
  },
  getFindingDetail: (id: number) => request<Finding>(`/findings/${id}`),

  // Ad-hoc Engines
  inspectRecon: (url: string) =>
    request<any>('/recon/inspect', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  inspectTargetRecon: (url: string) =>
    request<any>('/recon/inspect', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  scanPorts: (url: string, custom_ports?: number[]) =>
    request<any>('/ports/scan', {
      method: 'POST',
      body: JSON.stringify({ url, custom_ports }),
    }),
  analyzeSsl: (url: string) =>
    request<any>('/ssl/analyze', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  analyzeHeaders: (url: string) =>
    request<any>('/headers/analyze', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  // Live DAST Probes
  testSqliLive: (url: string) =>
    request<any>('/vulnerabilities/test-sqli', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  testXssLive: (url: string) =>
    request<any>('/vulnerabilities/test-xss', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  // CVE Intelligence
  getCveDatabase: (search?: string) =>
    request<{ total: number; items: CveItem[] }>(`/cve/database${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  checkBannerCve: (banner: string, technologies?: string[]) =>
    request<any>('/cve/check-banner', {
      method: 'POST',
      body: JSON.stringify({ banner, technologies: technologies || [] }),
    }),

  // Reports
  getReports: () => request<any[]>('/reports'),
  getReportDownloadUrl: (filename: string) => `${API_BASE}/reports/download/${filename}`,
  generateReportForScanUrl: (scanId: number) => `${API_BASE}/reports/generate/${scanId}`,

  // Settings & Audit
  getSettings: () => request<any>('/settings'),
  updateSettings: (data: any) =>
    request<any>('/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAuditLogs: () => request<any[]>('/settings/audit-logs'),
  resetDemoData: () => request<{ message: string }>('/settings/reset-demo', { method: 'POST' }),

  // AI & Machine Learning Intelligence Core
  predictEpss: (data: { cvss_score: number; category: string; has_poc?: boolean; is_remote?: boolean; requires_auth?: boolean }) =>
    request<any>('/ai/predict-epss', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  mutatePayloads: (data: { payload_type: string; base_target?: string }) =>
    request<any>('/ai/mutate-payloads', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  remediateFinding: (data: { finding_id?: number; title: string; category: string; severity: string; evidence?: string; target_url?: string }) =>
    request<any>('/ai/remediate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  auditCode: (data: { code: string; language?: string }) =>
    request<any>('/ai/audit-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  copilotChat: (data: { question: string; target_id?: number }) =>
    request<any>('/ai/copilot-chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getExecutiveSummary: (target_id?: number) =>
    request<any>(`/ai/executive-summary${target_id ? `?target_id=${target_id}` : ''}`, {
      method: 'POST',
    }),

  // API Security & OpenAPI Auditor
  auditApiSecurity: (data: { target_url?: string; spec_json?: string }) =>
    request<ApiAuditResult>('/api-security/audit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Cloud Recon & Subdomain Takeover
  scanCloudRecon: (data: { domain: string; check_takeover?: boolean; check_buckets?: boolean }) =>
    request<CloudReconResult>('/cloud-recon/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Compliance Matrix & Audit
  getComplianceMatrix: (targetId?: number) =>
    request<ComplianceMatrixResult>(targetId ? `/compliance/matrix?target_id=${targetId}` : '/compliance/matrix'),
  runComplianceAudit: (targetId?: number) =>
    request<ComplianceMatrixResult>('/compliance/audit', {
      method: 'POST',
      body: JSON.stringify({ target_id: targetId }),
    }),

  // Secret & Leaked API Key Scanner
  scanSecrets: (data: { target_url: string }) =>
    request<SecretScanResult>('/secrets/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Schedules & Webhooks
  getSchedules: () => request<ScheduleItem[]>('/schedules'),
  createSchedule: (data: ScheduleCreateData) =>
    request<ScheduleItem>('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  toggleSchedule: (id: number) =>
    request<{ id: number; is_active: boolean }>(`/schedules/${id}/toggle`, {
      method: 'POST',
    }),
  deleteSchedule: (id: number) =>
    request<{ success: boolean; message: string }>(`/schedules/${id}`, {
      method: 'DELETE',
    }),
  testWebhook: (data: { webhook_url: string; webhook_platform: string }) =>
    request<{ success: boolean; message: string }>('/schedules/test-webhook', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

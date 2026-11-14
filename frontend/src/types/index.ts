export interface Target {
  id: number;
  name: string;
  url: string;
  host: string;
  ip_address?: string;
  is_authorized: boolean;
  authorization_notes?: string;
  is_allowlisted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Finding {
  id: number;
  scan_id: number;
  target_id: number;
  title: string;
  category: 'RECON' | 'PORT' | 'SSL_TLS' | 'HEADERS' | 'SQLI' | 'XSS' | 'CVE' | 'MISCONFIG';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  confidence: string;
  cve_id?: string;
  cvss_score?: number;
  description: string;
  evidence?: string;
  impact?: string;
  remediation?: string;
  references_json?: string;
  created_at: string;
}

export interface ScanLog {
  id: number;
  scan_id: number;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
}

export interface Scan {
  id: number;
  target_id: number;
  target_name?: string;
  target_url?: string;
  scan_type: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  current_stage: string;
  security_score: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  summary_json?: string;
  findings?: Finding[];
  logs?: ScanLog[];
}

export interface DashboardStats {
  overall_score: number;
  total_targets: number;
  completed_scans: number;
  running_scans: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  total_findings: number;
  severity_distribution: { name: string; count: number; fill: string }[];
  category_distribution: { category: string; count: number }[];
  recent_scans: Scan[];
}

export interface CveItem {
  pattern: string;
  software: string;
  cve_id: string;
  cvss: number;
  severity: string;
  title: string;
  description: string;
  remediation: string;
}

// Advanced Cybersecurity Modules
export interface ApiSecurityFinding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  cwe: string;
  owasp: string;
  title: string;
  endpoint: string;
  method: string;
  description: string;
  remediation: string;
}

export interface ApiAuditResult {
  api_title: string;
  api_version: string;
  source_url: string;
  security_score: number;
  endpoints_audited: number;
  bola_candidates: number;
  unauthenticated_endpoints: number;
  missing_pagination: number;
  findings_count: number;
  severity_counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  findings: ApiSecurityFinding[];
}

export interface SubdomainTakeoverIssue {
  subdomain: string;
  cname_target: string;
  vulnerable: boolean;
  service: string;
  severity: string;
  description: string;
  remediation: string;
}

export interface CloudBucketIssue {
  provider: string;
  bucket_name: string;
  url: string;
  status: string;
  severity: string;
  description: string;
  remediation: string;
}

export interface CloudReconResult {
  domain: string;
  critical_issues: number;
  high_issues: number;
  subdomain_takeovers: SubdomainTakeoverIssue[];
  cloud_buckets: CloudBucketIssue[];
  total_assets_scanned: number;
}

export interface ComplianceControlViolation {
  id: number;
  title: string;
  severity: string;
  category: string;
}

export interface ComplianceControl {
  id: string;
  name: string;
  requirement: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'AT_RISK';
  violations_count: number;
  violating_findings: ComplianceControlViolation[];
}

export interface ComplianceFramework {
  framework: string;
  description: string;
  compliance_score: number;
  passed_controls: number;
  total_controls: number;
  overall_status: 'CERTIFIED_READY' | 'REMEDIATION_REQUIRED' | 'FAILING';
  controls: ComplianceControl[];
}

export interface ComplianceMatrixResult {
  total_frameworks: number;
  frameworks: ComplianceFramework[];
}

export interface SecretFinding {
  secret_type: string;
  severity: string;
  masked_value: string;
  source_url: string;
  source_type: string;
  description: string;
  remediation: string;
}

export interface SecretScanResult {
  target_url: string;
  scripts_scanned: number;
  secrets_count: number;
  secrets: SecretFinding[];
}

export interface ScheduleItem {
  id: number;
  target_id: number;
  target_name: string;
  target_url: string;
  scan_type: string;
  frequency: string;
  webhook_url?: string;
  webhook_platform?: string;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at?: string;
}

export interface ScheduleCreateData {
  target_id: number;
  scan_type: string;
  frequency: string;
  webhook_url?: string;
  webhook_platform?: string;
  is_active?: boolean;
}



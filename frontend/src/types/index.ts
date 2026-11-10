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


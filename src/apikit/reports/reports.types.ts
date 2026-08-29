import type { Paginated } from '../types';

export const REPORT_STATUSES = [
  'OPEN',
  'UNDER_REVIEW',
  'RESOLVED',
  'DISMISSED',
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/// Ordered least to most serious, so a sort or a comparison reads correctly.
export const REPORT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type ReportSeverity = (typeof REPORT_SEVERITIES)[number];

export const REPORT_TYPES = [
  'HARASSMENT',
  'FAKE_PROFILE',
  'UNSAFE_DRIVING',
  'NO_SHOW',
  'SCAM',
  'OTHER',
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export interface ReportParty {
  id: string;
  name: string;
  email: string;
}

export interface Report {
  id: string;
  type: ReportType;
  severity: ReportSeverity;
  status: ReportStatus;
  description: string;
  adminNote: string | null;
  rideId: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  /** Who raised it. */
  reporter: ReportParty;
  /** Who it is about. */
  reported: ReportParty;
}

export type ReportList = Paginated<Report, 'reports'>;

export interface ReportsQuery {
  status?: ReportStatus;
  severity?: ReportSeverity;
  page?: number;
  limit?: number;
}

export interface ResolveReportPayload {
  id: string;
  /** RESOLVE means the report was acted on; DISMISS means it was not upheld. */
  action: 'RESOLVE' | 'DISMISS';
  note?: string;
}

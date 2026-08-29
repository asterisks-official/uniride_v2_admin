import type { ReportSeverity, ReportType } from '@/apikit/reports';

/// Report types come off the wire as enum constants. Reports are read under
/// time pressure, so they are shown as words rather than SCREAMING_SNAKE.
const TYPE_LABELS: Record<ReportType, string> = {
  HARASSMENT: 'Harassment',
  FAKE_PROFILE: 'Fake profile',
  UNSAFE_DRIVING: 'Unsafe driving',
  NO_SHOW: 'No show',
  SCAM: 'Scam',
  OTHER: 'Other',
};

export function typeLabel(type: ReportType): string {
  return TYPE_LABELS[type] ?? type;
}

/**
 * Severity encoded as colour as well as text.
 *
 * A queue of reports is scanned, not read, and severity is the one field that
 * decides what gets opened first — so it has to survive peripheral vision.
 */
export function severityTone(severity: ReportSeverity): {
  dot: string;
  text: string;
  chip: string;
} {
  switch (severity) {
    case 'CRITICAL':
      return {
        dot: 'bg-destructive',
        text: 'text-destructive',
        chip: 'border-destructive/40 bg-destructive/10 text-destructive',
      };
    case 'HIGH':
      return {
        dot: 'bg-warning',
        text: 'text-warning',
        chip: 'border-warning/40 bg-warning/10 text-warning',
      };
    case 'MEDIUM':
      return {
        dot: 'bg-primary',
        text: 'text-primary',
        chip: 'border-primary/40 bg-primary-wash text-primary',
      };
    default:
      return {
        dot: 'bg-muted-foreground',
        text: 'text-muted-foreground',
        chip: 'border-border bg-secondary text-muted-foreground',
      };
  }
}

/// Open and under-review are actionable; resolved and dismissed are history.
export function isOpen(status: string): boolean {
  return status === 'OPEN' || status === 'UNDER_REVIEW';
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * How long a report has gone unanswered, in the words a reviewer triages by.
 *
 * Mirrors the verification queue deliberately: the two lists are worked the
 * same way, and "4 days" answers the triage question where a date makes you do
 * the arithmetic.
 */
export function openFor(iso: string): { label: string; days: number } {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days <= 0) {
    const hours = Math.floor(ms / 3_600_000);
    return { label: hours <= 0 ? 'Just now' : `${hours}h`, days: 0 };
  }
  if (days === 1) return { label: '1 day', days };
  return { label: `${days} days`, days };
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

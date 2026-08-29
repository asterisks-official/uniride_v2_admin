import type { RideStatus } from '@/apikit/rides';

/**
 * Status as colour as well as text.
 *
 * The list is scanned for the two states that need attention — a ride still
 * searching, and one in progress — so those carry the colour and the settled
 * states stay quiet.
 */
export function statusTone(status: RideStatus): string {
  switch (status) {
    case 'IN_PROGRESS':
      return 'border-primary/40 bg-primary-wash text-primary';
    case 'SEARCHING':
      return 'border-warning/40 bg-warning/10 text-warning';
    case 'COMPLETED':
      return 'border-success/40 bg-success/10 text-success';
    case 'CANCELLED':
      return 'border-destructive/40 bg-destructive/10 text-destructive';
    default:
      return 'border-border bg-secondary text-muted-foreground';
  }
}

export function statusLabel(status: RideStatus): string {
  return status.replace(/_/g, ' ').toLowerCase();
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Fare arrives as a decimal string; render it as money, not as a raw column. */
export function formatFare(fare: string): string {
  const n = Number(fare);
  return Number.isFinite(n) ? `৳${n.toFixed(0)}` : '—';
}

import type { UserRole } from '@/apikit/users';

/**
 * Trust score as a band rather than a bare number.
 *
 * It runs 0-100 and starts at 50, so "62" means nothing on its own to someone
 * deciding whether to suspend an account. The band is the judgement the number
 * exists to support.
 */
export function trustBand(score: number): { label: string; tone: string } {
  if (score >= 80) return { label: 'Strong', tone: 'text-success' };
  if (score >= 60) return { label: 'Good', tone: 'text-foreground' };
  if (score >= 40) return { label: 'Neutral', tone: 'text-muted-foreground' };
  if (score >= 20) return { label: 'Poor', tone: 'text-warning' };
  return { label: 'Very poor', tone: 'text-destructive' };
}

const ROLE_LABELS: Record<UserRole, string> = {
  PASSENGER: 'Passenger',
  RIDER: 'Rider',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super admin',
};

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

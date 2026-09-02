import { cn } from '@/lib/utils';

/**
 * The UniRide mark: a pin whose negative space is the road through it.
 *
 * Drawn rather than imported so it inherits `currentColor` and stays crisp at
 * every size — the landing page uses it at 28px in the nav and 40px in the
 * footer, and a raster asset would have to ship twice.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <path
        d="M16 2.5c-5.8 0-10.5 4.6-10.5 10.3 0 7.4 9.1 15.9 9.5 16.3a1.5 1.5 0 0 0 2 0c.4-.4 9.5-8.9 9.5-16.3C26.5 7.1 21.8 2.5 16 2.5Z"
        className="fill-current"
      />
      <path
        d="M11.5 19.5c1.6-1.2 2.4-2.9 2.4-5s.8-3.8 2.4-5"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="20" cy="10" r="2.1" fill="hsl(var(--primary-foreground))" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Mark className="size-7 text-primary" />
      <span className="text-[17px] font-semibold tracking-tight">UniRide</span>
    </span>
  );
}

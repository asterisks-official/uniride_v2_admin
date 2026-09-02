import { cn } from '@/lib/utils';

/**
 * Canonical store URL.
 *
 * The `pcampaignid=web_share` parameter from the share sheet is deliberately
 * dropped: it tags every visitor as having arrived from someone's share link,
 * which would misattribute all organic traffic from this page in Play Console.
 */
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.asterisks.uniride';

/** The Play glyph, in `currentColor` so it inherits whatever it sits on. */
function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M3 20.5V3.5c0-.59.34-1.11.84-1.35L13.69 12 3.84 21.85c-.5-.25-.84-.76-.84-1.35m13.81-5.38l-10.76 6.22 8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31M6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66Z" />
    </svg>
  );
}

/**
 * Download call to action.
 *
 * `variant="solid"` is the page's primary action; `"ghost"` is the compact one
 * that fades into the header past the fold. Both open in a new tab — sending a
 * visitor off to the Play Store in the same tab loses the page they were
 * reading, and they may well want to come back to it.
 */
export function PlayButton({
  variant = 'solid',
  className,
}: {
  variant?: 'solid' | 'ghost';
  className?: string;
}) {
  const solid = variant === 'solid';

  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get UniRide on Google Play"
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-xl outline-none transition-all duration-300 ease-smooth focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        solid
          ? 'h-12 gap-3 bg-primary px-6 text-primary-foreground shadow-[0_1px_2px_rgba(9,98,57,.3),0_8px_24px_-8px_rgba(9,98,57,.45)] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(9,98,57,.3),0_14px_32px_-10px_rgba(9,98,57,.55)] active:translate-y-0'
          : 'h-9 gap-2 border border-border/80 bg-card px-3.5 text-[13px] font-medium hover:-translate-y-px hover:border-primary/30 hover:shadow-md',
        className,
      )}
    >
      {solid && (
        // One pass on hover, not a loop — a looping shimmer on a primary
        // action reads as a loading state.
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      )}

      <PlayGlyph
        className={cn(
          'shrink-0 transition-transform duration-300 ease-smooth group-hover:scale-110',
          solid ? 'size-5' : 'size-4',
        )}
      />

      {solid ? (
        <span className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] opacity-80">
            Get it on
          </span>
          <span className="mt-1 text-[15px] font-semibold">Google Play</span>
        </span>
      ) : (
        <span>Get the app</span>
      )}
    </a>
  );
}

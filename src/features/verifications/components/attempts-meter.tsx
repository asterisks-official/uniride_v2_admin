import { MAX_REJECTIONS } from '@/apikit/verifications';
import { cn } from '@/lib/utils';

/**
 * Three pips, filled as strikes are used.
 *
 * A number alone ("1 left") makes you remember what the limit was. Pips show
 * the position in a fixed sequence at a glance, and the last one reads as
 * dangerous without needing to be read at all.
 */
export function AttemptsMeter({
  used,
  showLabel = true,
}: {
  used: number;
  showLabel?: boolean;
}) {
  const left = Math.max(0, MAX_REJECTIONS - used);
  const critical = left <= 1;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: MAX_REJECTIONS }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 w-4 rounded-full transition-colors',
              i < used
                ? critical
                  ? 'bg-destructive'
                  : 'bg-warning'
                : 'bg-border',
            )}
          />
        ))}
      </div>
      {showLabel ? (
        <span
          className={cn(
            'text-[11.5px] font-medium tabular-nums',
            critical ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {left === 0 ? 'blocked' : `${left} left`}
        </span>
      ) : null}
      <span className="sr-only">
        {used} of {MAX_REJECTIONS} attempts used
      </span>
    </div>
  );
}

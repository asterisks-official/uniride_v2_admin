import { Mark } from './brand';
import { PlayButton } from './play-button';
import { RouteLine } from './route-line';

/**
 * The fold.
 *
 * One claim, one sentence of support, two actions — and a quiet piece of proof
 * underneath. Everything animates in on load with a short stagger rather than
 * arriving at once, because a page that assembles itself reads as considered
 * and a page that snaps into place reads as static.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36 sm:pb-32 sm:pt-44">
      {/* Ambient ground. Two slow, offset radial washes — enough to keep the
          corner from being flat, far too soft to compete with the headline. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="ur-float absolute -left-32 -top-40 size-[34rem] rounded-full bg-primary/[0.07] blur-3xl" />
        <div
          className="ur-float absolute -right-40 top-10 size-[28rem] rounded-full bg-primary-deep/[0.05] blur-3xl"
          style={{ animationDelay: '-6s' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <p
          className="ur-rise inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-wash px-3.5 py-1.5 text-[13px] font-medium text-primary"
          style={{ animationDelay: '40ms' }}
        >
          <Mark className="size-3.5" />
          Built for university campuses
        </p>

        <h1
          className="ur-rise mt-7 text-balance text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-6xl"
          style={{ animationDelay: '120ms' }}
        >
          Campus rides between
          <br className="hidden sm:block" />{' '}
          <span className="ur-gradient-text">students you can verify</span>
        </h1>

        <p
          className="ur-rise mx-auto mt-6 max-w-xl text-balance text-[17px] leading-relaxed text-muted-foreground"
          style={{ animationDelay: '200ms' }}
        >
          Someone on your campus is already making your journey. UniRide matches
          you with them, sets the fare before either of you asks, and keeps a
          record of the trip.
        </p>

        <div
          className="ur-rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: '280ms' }}
        >
          {/* The app is live, so downloading it is the primary action and
              reading on is the secondary one. */}
          <PlayButton className="w-full sm:w-auto" />

          <a
            href="#how"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border/80 bg-card px-6 text-[15px] font-medium outline-none transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 sm:w-auto"
          >
            See how it works
          </a>
        </div>
      </div>

      <div
        className="ur-rise mx-auto mt-16 max-w-4xl"
        style={{ animationDelay: '360ms' }}
      >
        <RouteLine className="h-auto w-full" />
      </div>

      <div
        className="ur-rise mx-auto mt-10 max-w-4xl"
        style={{ animationDelay: '440ms' }}
      >
        <ProofStrip />
      </div>
    </section>
  );
}

/** Three claims the product actually enforces, stated without adjectives. */
function ProofStrip() {
  const items = [
    { k: 'Every rider', v: 'ID and licence reviewed' },
    { k: 'Every fare', v: 'Fixed before you book' },
    { k: 'Every trip', v: 'Recorded end to end' },
  ];

  return (
    <div className="grid divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {items.map((item) => (
        <div key={item.k} className="px-6 py-5 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {item.k}
          </p>
          <p className="mt-1.5 text-[15px] font-medium">{item.v}</p>
        </div>
      ))}
    </div>
  );
}

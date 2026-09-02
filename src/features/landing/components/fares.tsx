'use client';

import { useState } from 'react';

import { useCountUp, usePrefersReducedMotion } from '../use-count-up';
import { Reveal } from './reveal';
import { SectionLabel } from './how-it-works';
import { Spotlight } from './spotlight';

/**
 * Illustrative coefficients only.
 *
 * Real rates are set per university on its own record and are tunable without a
 * release, so this section deliberately shows the *shape* of the calculation
 * rather than quoting a price the platform would then be held to. The numbers
 * below exist to make the arithmetic legible, and the caption says so.
 */
const EXAMPLE = { base: 15, perKm: 7, minimum: 40 };

export function Fares() {
  const [km, setKm] = useState(9);

  const reduced = usePrefersReducedMotion();

  const computed = Math.round(EXAMPLE.base + EXAMPLE.perKm * km);
  const total = Math.max(computed, EXAMPLE.minimum);
  const floored = total > computed;

  // Animated separately from `total` so the breakdown above stays exact while
  // the headline figure travels to it.
  const shownTotal = useCountUp(total, { disabled: reduced });

  return (
    <section id="fares" className="scroll-mt-20 border-t border-border/70 px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-5xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <SectionLabel>Fares</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            The price is settled before anyone gets on
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
            The fare comes from the actual road distance between your two
            points, calculated on the server and shown to both people as the
            same number. It is fixed when the ride is posted and never
            recalculated afterwards.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
            A short trip is protected by a minimum, because a fare nobody will
            accept is worse for you than an honest floor. Each university sets
            its own rates.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <Spotlight className="rounded-2xl border border-border/70 bg-card p-7 shadow-[0_1px_2px_rgba(20,24,26,.04),0_12px_40px_-16px_rgba(20,24,26,.12)] transition-shadow duration-500 hover:shadow-[0_1px_2px_rgba(20,24,26,.04),0_18px_50px_-18px_rgba(20,24,26,.18)]">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="ur-distance"
                className="text-[13px] font-medium text-muted-foreground"
              >
                Trip distance
              </label>
              <span className="text-[13px] font-medium tabular-nums">
                {km.toFixed(1)} km
              </span>
            </div>

            <input
              id="ur-distance"
              type="range"
              min={1}
              max={25}
              step={0.5}
              value={km}
              onChange={(e) => setKm(Number(e.target.value))}
              className="ur-range mt-3 w-full"
              aria-describedby="ur-fare-total"
            />

            <dl className="mt-7 space-y-3 text-[14.5px]">
              <Line label="Base" value={`৳${EXAMPLE.base}`} />
              <Line
                label={`Distance · ${km.toFixed(1)} km`}
                value={`৳${(EXAMPLE.perKm * km).toFixed(0)}`}
              />
              {floored && (
                <div className="ur-line-in">
                  <Line
                    label="Minimum fare applied"
                    value={`+৳${total - computed}`}
                    accent
                  />
                </div>
              )}
            </dl>

            <div className="mt-6 flex items-baseline justify-between border-t border-border pt-6">
              <span className="text-[15px] font-medium">Total</span>
              <span
                id="ur-fare-total"
                aria-live="polite"
                className="text-[2rem] font-semibold tabular-nums tracking-[-0.02em] text-primary"
              >
                ৳{shownTotal}
              </span>
            </div>

            <p className="mt-5 text-[12.5px] leading-relaxed text-muted-foreground">
              Illustrative rates, shown to explain the calculation. Actual fares
              are configured per university.
            </p>
          </Spotlight>
        </Reveal>
      </div>
    </section>
  );
}

function Line({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className={accent ? 'text-primary' : 'text-muted-foreground'}>
        {label}
      </dt>
      <dd
        className={`tabular-nums ${accent ? 'text-primary' : 'text-foreground'}`}
      >
        {value}
      </dd>
    </div>
  );
}

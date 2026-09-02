import { Reveal } from './reveal';
import { Spotlight } from './spotlight';

const STEPS = [
  {
    n: '01',
    title: 'Post where you are going',
    body: 'Drop a pin for the pickup and one for the destination. Riders post the trip they are already making; passengers post the one they need.',
  },
  {
    n: '02',
    title: 'The fare is worked out for you',
    body: 'Priced from the real road distance, on the server, before anyone commits. Neither side names a number, so there is nothing to haggle over.',
  },
  {
    n: '03',
    title: 'Match, ride, settle',
    body: 'Everyone eligible on the other side of the market is notified. You choose who you go with, and both of you confirm the trip started and ended.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-border/70 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Three steps, and none of them is a negotiation
          </h2>
        </Reveal>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/70 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 90}>
              <Spotlight className="group relative h-full bg-card p-7 transition-colors duration-500 hover:bg-primary-wash/40">
              <span className="text-[13px] font-semibold tabular-nums tracking-[0.1em] text-primary/60 transition-colors duration-500 group-hover:text-primary">
                {step.n}
              </span>
              <h3 className="mt-4 text-[17px] font-semibold leading-snug tracking-[-0.01em]">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
              {/* Rules in from the left on hover. Cheap, and it makes the card
                  feel like it responded rather than merely changed colour. */}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-primary transition-transform duration-500 ease-smooth group-hover:scale-x-100"
              />
              </Spotlight>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.16em] text-primary">
      <span aria-hidden className="h-px w-6 bg-primary/40" />
      {children}
    </p>
  );
}

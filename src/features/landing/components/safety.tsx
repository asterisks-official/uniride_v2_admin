import { Reveal } from './reveal';
import { SectionLabel } from './how-it-works';

const CONTROLS = [
  {
    title: 'Riders are checked by a person',
    body: 'Licence, student ID, the vehicle and its number plate — reviewed by hand, not by a checkbox. A live face check on the applicant’s own phone confirms the documents belong to them.',
  },
  {
    title: 'A closed campus community',
    body: 'Accounts are tied to a university and its email domains. You are matched with people from your own institution, not with the general public.',
  },
  {
    title: 'Women-only rides, actually enforced',
    body: 'A restricted ride is invisible to anyone it is not for, cannot be joined by them, and cannot be posted by them either. The rule is applied on the server at every door.',
  },
  {
    title: 'Trips leave a record',
    body: 'Both people confirm the ride started, and both confirm it ended. Each of those four moments is stamped with where the phone was, so a disputed trip is not one person’s word.',
  },
  {
    title: 'Ratings neither side can game',
    body: 'You cannot see how you were rated until you have rated too. Both are revealed at once, which keeps a score from becoming a reply.',
  },
  {
    title: 'A ban that outlasts the account',
    body: 'Serious breaches block the email, the phone number and the student ID — not just the login — so a fresh signup is not a way back in.',
  },
];

export function Safety() {
  return (
    <section
      id="safety"
      className="relative scroll-mt-20 overflow-hidden border-t border-border/70 bg-shell px-6 py-24 text-shell-foreground sm:py-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="ur-float absolute -right-20 top-0 size-[30rem] rounded-full bg-primary/20 blur-[120px]" />
        <div
          className="ur-float absolute -bottom-32 left-0 size-[24rem] rounded-full bg-primary/10 blur-[100px]"
          style={{ animationDelay: '-8s' }}
        />
      </div>

      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.16em] text-primary-wash/70">
            <span aria-hidden className="h-px w-6 bg-primary-wash/30" />
            Safety
          </p>
          <h2 className="mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            The part that cannot be a promise
          </h2>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-shell-muted">
            Getting on a stranger’s motorcycle is the whole risk of this
            product. Every control below is enforced on the server, where it
            cannot be worked around by the app.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {CONTROLS.map((control, i) => (
            <Reveal key={control.title} delay={(i % 2) * 80} className="group">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="mt-1.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 transition-all duration-500 group-hover:border-primary group-hover:bg-primary/25"
                >
                  <span className="size-1.5 rounded-full bg-primary transition-transform duration-500 group-hover:scale-125" />
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold tracking-[-0.01em]">
                    {control.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-shell-muted">
                    {control.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export { SectionLabel };

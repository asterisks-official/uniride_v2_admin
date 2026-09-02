import { Wordmark } from './brand';
import { PlayButton } from './play-button';
import { Reveal } from './reveal';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
              University ride sharing, built around the people already making
              the journey.
            </p>
          </div>

          <PlayButton variant="ghost" className="shrink-0" />
        </Reveal>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/70 pt-7 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} UniRide</p>
          <p>uniridebd.com</p>
        </div>
      </div>
    </footer>
  );
}

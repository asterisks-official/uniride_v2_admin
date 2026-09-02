'use client';

import { useEffect, useRef } from 'react';

/**
 * A hairline at the very top that fills as the page is read.
 *
 * Written straight to a CSS custom property through a ref rather than through
 * React state: this updates on every scroll frame, and re-rendering a component
 * 60 times a second to move one line is how a smooth page stops being smooth.
 *
 * The read and the write are split across a rAF callback so the scroll handler
 * itself only schedules — measuring layout inside the listener would force a
 * synchronous reflow on the same frame the browser is trying to scroll.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      // A page shorter than the viewport has no progress to report; showing a
      // full bar there would be a lie about how much is left.
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      el.style.setProperty('--ur-progress', String(Math.min(1, progress)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="ur-progress pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-primary to-primary-deep"
    />
  );
}

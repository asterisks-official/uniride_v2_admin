'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Fades and lifts its children in the first time they scroll into view.
 *
 * An IntersectionObserver rather than a scroll listener: the browser does the
 * work off the main thread, so the reveal cannot be the thing that makes the
 * page feel heavy — which would defeat the point of having it.
 *
 * Unobserves on the first intersection. A section that re-animates every time
 * it passes the fold reads as a glitch, not as polish, and it makes the page
 * tiring to scroll back up.
 *
 * Motion here is decorative, so `prefers-reduced-motion` is honoured in CSS
 * (see globals.css) rather than branched on here — the content must be visible
 * either way, and the safest way to guarantee that is for the "hidden" state to
 * simply not exist when motion is off.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger, in milliseconds. Keep under ~400ms; beyond that it reads as lag. */
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.unobserve(entry.target);
      },
      // A little before the element is fully on screen, so the motion finishes
      // about when the reader's eye arrives rather than starting then.
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-visible={visible}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn('ur-reveal', className)}
    >
      {children}
    </Tag>
  );
}

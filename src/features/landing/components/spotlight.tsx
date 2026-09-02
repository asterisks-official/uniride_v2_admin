'use client';

import { useRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * A soft highlight that follows the pointer across a card.
 *
 * Position is pushed into two CSS custom properties on the element itself, so
 * the effect is drawn entirely by the compositor and React never re-renders on
 * pointer movement. State here would mean a render per mousemove — the exact
 * thing that makes a "polished" page feel sticky.
 *
 * Reads are batched into a rAF callback: `getBoundingClientRect()` inside the
 * pointermove handler would force layout on every event.
 *
 * Purely decorative and pointer-only. Nothing is conveyed by it, so touch and
 * keyboard users lose nothing, and reduced-motion hides it in CSS.
 */
export function Spotlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const next = useRef({ x: 0, y: 0 });

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    // Coarse pointers "hover" only at the moment of a tap, where a highlight
    // chasing the finger is noise rather than feedback.
    if (event.pointerType !== 'mouse') return;
    next.current = { x: event.clientX, y: event.clientY };

    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--ur-x', `${next.current.x - rect.left}px`);
      el.style.setProperty('--ur-y', `${next.current.y - rect.top}px`);
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn('ur-spotlight', className)}
    >
      {children}
    </div>
  );
}

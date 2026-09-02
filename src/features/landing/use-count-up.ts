'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Eases a number towards its target instead of snapping to it.
 *
 * The fare is the one figure on the page a visitor actually watches, and a
 * value that jumps between slider steps reads as a recalculation while a value
 * that travels reads as a meter. Same arithmetic, very different feel.
 *
 * Exponential smoothing on a rAF loop rather than a fixed-duration tween:
 * dragging the slider retargets continuously, and a tween would restart on
 * every input event and never arrive.
 *
 * The loop stops once it is within half a unit of the target — a display
 * rounded to whole Taka has nothing left to show below that, and an animation
 * frame that changes no pixels is pure battery cost.
 */
export function useCountUp(target: number, { disabled = false } = {}) {
  const [value, setValue] = useState(target);
  const raf = useRef(0);
  const current = useRef(target);

  useEffect(() => {
    if (disabled) {
      current.current = target;
      setValue(target);
      return;
    }

    const step = () => {
      const delta = target - current.current;

      if (Math.abs(delta) < 0.5) {
        current.current = target;
        setValue(target);
        raf.current = 0;
        return;
      }

      current.current += delta * 0.18;
      setValue(current.current);
      raf.current = requestAnimationFrame(step);
    };

    if (!raf.current) raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [target, disabled]);

  return Math.round(value);
}

/**
 * Whether the visitor has asked for less motion.
 *
 * Starts false so the server and the first client render agree — reading the
 * media query during render would differ between them and trip hydration.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

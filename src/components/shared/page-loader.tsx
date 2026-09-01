'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { SpinnerIcon } from '@/components/icons';

/**
 * A route change in the App Router has no built-in "in flight" signal a
 * server component can render — the URL only updates once the new page is
 * ready. Without this, a slow navigation (a big table, a cold data fetch)
 * looks like the click did nothing until the page suddenly swaps in.
 *
 * `showPageLoader` is a module-level escape hatch rather than a hook so it can
 * be called from anywhere — a mutation's `onSuccess`, an imperative
 * `router.push` — without threading a context through every caller.
 */
let globalShow: (() => void) | null = null;
let globalHide: (() => void) | null = null;

export function showPageLoader(): void {
  globalShow?.();
}

export function hidePageLoader(): void {
  globalHide?.();
}

const MIN_DISPLAY_MS = 300;
const MAX_DISPLAY_MS = 8000;

function usePageLoaderState(): boolean {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const urlKey = `${pathname}?${searchParams.toString()}`;
  const prevUrlKeyRef = useRef(urlKey);
  const shownAtRef = useRef<number | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    shownAtRef.current = Date.now();
    setLoading(true);
    clearTimeout(safetyTimer.current);
    safetyTimer.current = setTimeout(() => setLoading(false), MAX_DISPLAY_MS);
  }, []);

  // A hide that lands before MIN_DISPLAY_MS has elapsed reads as a flicker
  // rather than feedback, so a fast navigation still holds the spinner briefly.
  const hide = useCallback(() => {
    clearTimeout(hideTimer.current);
    const elapsed = shownAtRef.current ? Date.now() - shownAtRef.current : MIN_DISPLAY_MS;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    hideTimer.current = setTimeout(() => {
      clearTimeout(safetyTimer.current);
      setLoading(false);
    }, remaining);
  }, []);

  useEffect(() => {
    globalShow = show;
    globalHide = hide;
    return () => {
      globalShow = null;
      globalHide = null;
    };
  }, [show, hide]);

  useEffect(() => {
    if (urlKey !== prevUrlKeyRef.current) {
      prevUrlKeyRef.current = urlKey;
      const t = setTimeout(hide, 0);
      return () => clearTimeout(t);
    }
  }, [urlKey, hide]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      if (anchor.target === '_blank') return;
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.search === location.search) return;
      } catch {
        return;
      }
      show();
    }
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [show]);

  useEffect(() => {
    return () => {
      clearTimeout(safetyTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  return loading;
}

function PageLoaderOverlay() {
  const loading = usePageLoaderState();

  return (
    <div
      aria-hidden={!loading}
      className="fixed inset-0 z-[100] grid place-items-center bg-background/40 backdrop-blur-[2px] transition-opacity duration-200"
      style={{ opacity: loading ? 1 : 0, pointerEvents: loading ? 'auto' : 'none' }}
    >
      <SpinnerIcon className="size-10 animate-spin text-primary" />
    </div>
  );
}

/** Mounted once in the dashboard shell. Shows on any same-origin link click, hides on arrival. */
export function PageLoader() {
  return (
    <Suspense fallback={null}>
      <PageLoaderOverlay />
    </Suspense>
  );
}

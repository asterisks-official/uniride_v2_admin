'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Wordmark } from './brand';
import { PlayButton } from './play-button';

const LINKS = [
  { id: 'how', label: 'How it works' },
  { id: 'safety', label: 'Safety' },
  { id: 'fares', label: 'Fares' },
];

/**
 * Sticky header that only grows a surface once the page has moved, with a pill
 * that slides between links to track the section in view.
 *
 * The pill is one absolutely-positioned element whose transform is measured
 * from the active link, rather than a background on each link. Moving one
 * element gives a continuous slide between items; toggling a class on three
 * gives a cut, and the difference is most of what reads as "smooth" here.
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  // Held back until the hero's own download button has scrolled away. Two
  // identical calls to action on screen at once split the visitor's attention
  // and make neither feel like the thing to do.
  const [showCta, setShowCta] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setShowCta(y > 420);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Which section owns the viewport. Tracked with an observer rather than by
  // comparing offsets on scroll, so the work happens off the main thread.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (sections.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        // The most-visible section wins. Picking the first intersecting one
        // makes the pill flicker backwards where two sections overlap.
        let best: string | null = null;
        let bestRatio = 0;
        // forEach rather than for..of: the project targets a TS level where
        // iterating a Map directly needs downlevelIteration.
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        });
        setActive(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-20% 0px -35% 0px' },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Park the pill over the active link. Runs after paint so the measurement
  // sees final layout, and on resize because the links reflow.
  useEffect(() => {
    const move = () => {
      const pill = pillRef.current;
      const list = listRef.current;
      if (!pill || !list) return;

      if (!active) {
        pill.style.opacity = '0';
        return;
      }
      const link = list.querySelector<HTMLAnchorElement>(
        `[data-section="${active}"]`,
      );
      if (!link) return;

      pill.style.opacity = '1';
      pill.style.width = `${link.offsetWidth}px`;
      pill.style.transform = `translateX(${link.offsetLeft}px)`;
    };

    move();
    window.addEventListener('resize', move);
    return () => window.removeEventListener('resize', move);
  }, [active]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-smooth',
        scrolled
          ? 'border-b border-border/70 bg-background/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="rounded-md outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <Wordmark />
        </Link>

        <div ref={listRef} className="relative hidden items-center md:flex">
          <span
            ref={pillRef}
            aria-hidden
            className="absolute inset-y-0 left-0 -z-10 rounded-full bg-primary-wash opacity-0 transition-all duration-500 ease-smooth"
          />
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              data-section={link.id}
              className={cn(
                'rounded-full px-4 py-2 text-sm outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring',
                active === link.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Fades in once the hero's button is gone, so there is always exactly
            one download call to action on screen. `invisible` rather than
            unmounted: the slot keeps its width, so the links do not shift
            sideways when it appears. */}
        <PlayButton
          variant="ghost"
          className={cn(
            'transition-all duration-500 ease-smooth',
            showCta
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none invisible -translate-y-1 opacity-0',
          )}
        />
      </nav>
    </header>
  );
}

/**
 * A route that draws itself, with a rider travelling it.
 *
 * The one piece of decoration on the page that is actually about the product:
 * two pins, the road between them, and something moving along it. A generic
 * abstract shape would have cost the same and said nothing.
 *
 * Pure SVG and CSS — no JS, no layout thrash, and it renders in the server HTML
 * so it is present on the first paint rather than popping in after hydration.
 *
 * `pathLength="1"` normalises the dash maths: the stroke can be animated from
 * fully hidden to fully drawn with `stroke-dashoffset: 1 → 0`, without anyone
 * having to measure the real path length and hard-code it.
 */
export function RouteLine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 150"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* The road, ghosted. Gives the drawn line something to arrive along, so
          the animation reads as tracing a route rather than growing a tendril. */}
      <path
        d="M40 110 C 150 110, 170 40, 280 40 S 430 110, 530 78 S 650 40, 690 40"
        stroke="hsl(var(--border))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 6"
      />

      <path
        id="ur-route"
        d="M40 110 C 150 110, 170 40, 280 40 S 430 110, 530 78 S 650 40, 690 40"
        pathLength="1"
        className="ur-route-draw"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Origin pin */}
      <circle cx="40" cy="110" r="7" fill="hsl(var(--background))" />
      <circle
        cx="40"
        cy="110"
        r="5"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
      />

      {/* Destination pin, with a slow pulse so the eye finishes where the
          route does. */}
      <circle cx="690" cy="40" r="7" fill="hsl(var(--background))" />
      <circle cx="690" cy="40" r="4.5" fill="hsl(var(--primary))" />
      <circle
        cx="690"
        cy="40"
        r="4.5"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        className="ur-pin-pulse"
      />

      {/* The traveller. offset-path keeps it exactly on the curve; browsers
          without it simply do not render the dot, and the route is unharmed. */}
      <circle r="4" fill="hsl(var(--primary))" className="ur-route-rider" />
    </svg>
  );
}

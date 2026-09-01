import { cn } from '@/lib/utils';

/**
 * Visually merges two controls into one bordered field — a number input with
 * an adjoining unit selector, say. Renders the border and focus ring; the
 * children are whatever inputs the caller places inside.
 */
export function InputGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex h-10 w-full items-center overflow-hidden rounded-lg border border-input bg-transparent px-2.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        className,
      )}
    >
      {children}
    </div>
  );
}

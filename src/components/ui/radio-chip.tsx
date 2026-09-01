import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';

import { RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

/** A row of bordered, pill-shaped options rather than plain radio dots — for
 * a small, fixed set of choices read at a glance (a plan tier, a type toggle). */
function RadioChipGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-chip-group"
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    />
  );
}

interface RadioChipProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

function RadioChip({ value, children, disabled, className }: RadioChipProps) {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors',
        'has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary-wash has-[[data-checked]]:text-primary',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <RadioGroupItem value={value} disabled={disabled} />
      {children}
    </label>
  );
}

export { RadioChipGroup, RadioChip };

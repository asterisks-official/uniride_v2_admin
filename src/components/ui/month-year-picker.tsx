'use client';

import { useState } from 'react';

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

interface MonthYearPickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  'aria-invalid'?: boolean;
  className?: string;
}

/** A month grid for one year at a time, with year navigation above it. */
export function MonthYearPicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select month & year',
  disabled,
  clearable = true,
  'aria-invalid': ariaInvalid,
  className,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? new Date().getFullYear());

  const isMonthDisabled = (monthIndex: number) => {
    const date = new Date(viewYear, monthIndex, 1);
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) return true;
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) return true;
    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            className={cn(
              'w-fit justify-start font-normal',
              !value && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-4" />
        {value ? `${MONTHS[value.getMonth()]} ${value.getFullYear()}` : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewYear((y) => y - 1)}
            disabled={Boolean(minDate) && viewYear <= minDate!.getFullYear()}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="text-[13px] font-semibold">{viewYear}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewYear((y) => y + 1)}
            disabled={Boolean(maxDate) && viewYear >= maxDate!.getFullYear()}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {MONTHS.map((month, index) => {
            const isSelected =
              value?.getFullYear() === viewYear && value?.getMonth() === index;
            return (
              <Button
                key={month}
                type="button"
                variant={isSelected ? 'default' : 'ghost'}
                size="sm"
                disabled={isMonthDisabled(index)}
                className="text-[12.5px]"
                onClick={() => {
                  onChange(new Date(Date.UTC(viewYear, index, 1, 12, 0, 0)));
                  setOpen(false);
                }}
              >
                {month}
              </Button>
            );
          })}
        </div>

        {clearable && value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-fit text-muted-foreground"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
          >
            Clear
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

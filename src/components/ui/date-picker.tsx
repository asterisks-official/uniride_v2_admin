'use client';

import { useState } from 'react';

import { CalendarIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean;
  className?: string;
}

/** A single day, picked from a calendar popover — not a range, not a time. */
export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select a date',
  disabled,
  'aria-invalid': ariaInvalid,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

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
              'w-full justify-start font-normal',
              !value && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-4" />
        {value ? formatDate(value) : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          disabled={(date) => (minDate && date < minDate) || (maxDate && date > maxDate) || false}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

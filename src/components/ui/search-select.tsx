'use client';

import { useMemo, useState } from 'react';

import { CheckIcon, SelectExpandIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface SearchSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SearchSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  options: SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean;
  className?: string;
}

/**
 * A single-select combobox — the trigger shows the chosen label, the popover
 * filters the list as you type. For a plain short list without search, the
 * ordinary Select in `components/ui/select.tsx` is the right, lighter choice.
 */
export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = 'Select item...',
  searchPlaceholder = 'Search...',
  disabled,
  'aria-invalid': ariaInvalid,
  className,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [search, options]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch('');
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            className={cn(
              'w-full justify-between font-normal',
              !value && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <span className="truncate">{selectedLabel ?? placeholder}</span>
        <SelectExpandIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--anchor-width] p-0">
        <div className="border-b border-border p-2">
          <Input
            autoFocus
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ScrollArea className="max-h-72">
          <div className="p-1">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-muted-foreground">
                No options found.
              </p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] transition-colors',
                    'hover:bg-muted',
                    value === option.value && 'bg-muted font-medium',
                    option.disabled && 'pointer-events-none opacity-50',
                  )}
                >
                  <CheckIcon
                    className={cn('size-4 shrink-0', value === option.value ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

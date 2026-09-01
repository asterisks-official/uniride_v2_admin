'use client';

import { useMemo, useState } from 'react';

import { CheckIcon, CloseIcon, SelectExpandIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import type { SearchSelectOption } from './search-select';

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean;
  className?: string;
}

/** Like SearchSelect, but the trigger shows removable tag chips for each pick. */
export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  disabled,
  'aria-invalid': ariaInvalid,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [search, options]);

  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  }

  function remove(optionValue: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  }

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
            className={cn('h-auto min-h-9 w-full justify-between font-normal', className)}
          />
        }
      >
        <span className="flex flex-1 flex-wrap gap-1">
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            value.map((v) => {
              const label = options.find((o) => o.value === v)?.label ?? v;
              return (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 rounded-md bg-primary-wash px-2 py-0.5 text-[12px] font-medium text-primary"
                >
                  {label}
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => remove(v, e)}
                    className="text-primary/60 hover:text-primary"
                  >
                    <CloseIcon className="size-3" />
                  </span>
                </span>
              );
            })
          )}
        </span>
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
              filtered.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => toggle(option.value)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] transition-colors',
                      'hover:bg-muted',
                      isSelected && 'bg-muted font-medium',
                      option.disabled && 'pointer-events-none opacity-50',
                    )}
                  >
                    <CheckIcon className={cn('size-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

import * as React from 'react';

import { HidePasswordIcon, ShowPasswordIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface BITInputProps extends Omit<React.ComponentProps<'input'>, 'prefix'> {
  label?: string;
  showRequiredSign?: boolean;
  helperText?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
  suffix?: React.ReactNode;
  containerClassName?: string;
}

/**
 * The labeled, fixed-height (40px) input used across forms — modeled on the
 * old project's RYInput, minus the react-hook-form `FormContext` coupling it
 * was built on. This project spreads `register()` directly onto controls
 * instead, so `BITInput` is forwardRef like `Input`/`Textarea` and takes
 * `error` as a plain prop rather than reading it off a form context.
 */
const BITInput = React.forwardRef<HTMLInputElement, BITInputProps>(
  (
    {
      id,
      label,
      showRequiredSign,
      helperText,
      error,
      prefixIcon,
      suffix,
      type = 'text',
      className,
      containerClassName,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label ? (
          <Label htmlFor={inputId}>
            {label}
            {showRequiredSign ? <span className="text-destructive">*</span> : null}
          </Label>
        ) : null}

        <div className="relative">
          {prefixIcon ? (
            <div className="pointer-events-none absolute inset-y-0 left-0 grid w-9 place-items-center text-muted-foreground">
              {prefixIcon}
            </div>
          ) : null}

          <Input
            id={inputId}
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={cn(
              'h-10',
              prefixIcon && 'pl-9',
              (suffix || isPassword) && 'pr-9',
              className,
            )}
            {...props}
          />

          {isPassword ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-1 my-auto text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              {showPassword ? (
                <HidePasswordIcon className="size-[17px]" />
              ) : (
                <ShowPasswordIcon className="size-[17px]" />
              )}
            </Button>
          ) : suffix ? (
            <div className="absolute inset-y-0 right-0 grid w-9 place-items-center text-muted-foreground">
              {suffix}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="text-[12.5px] text-destructive">{error}</p>
        ) : helperText ? (
          <p className="text-[12.5px] text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  },
);
BITInput.displayName = 'BITInput';

export { BITInput };

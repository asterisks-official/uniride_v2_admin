import { REGEXP_ONLY_DIGITS } from 'input-otp';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  'aria-invalid'?: boolean;
  className?: string;
}

/**
 * Not a native input, so react-hook-form needs `Controller` here rather than
 * `register()` — same as any control that isn't a plain `<input>`.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus,
  'aria-invalid': ariaInvalid,
  className,
}: OtpInputProps) {
  return (
    <InputOTP
      value={value}
      onChange={onChange}
      maxLength={length}
      pattern={REGEXP_ONLY_DIGITS}
      disabled={disabled}
      autoFocus={autoFocus}
      className={className}
    >
      <InputOTPGroup>
        {Array.from({ length }, (_, index) => (
          <InputOTPSlot key={index} index={index} aria-invalid={ariaInvalid} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

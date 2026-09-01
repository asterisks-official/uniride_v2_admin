'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { LockIcon, MailIcon, SpinnerIcon } from '@/components/icons';
import { BITInput } from '@/components/ui/bit-input';
import { Button } from '@/components/ui/button';

import { loginSchema, type LoginValues } from '../schemas/login.schema';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);

    const result = await signIn('credentials', {
      ...values,
      redirect: false,
    });

    if (!result?.ok) {
      // NextAuth surfaces authorize()'s thrown message here, so a suspended
      // account or a non-admin role explains itself rather than saying
      // "invalid credentials".
      setFormError(result?.error ?? 'Could not sign you in.');
      return;
    }

    // `from` is set by middleware when it intercepts a deep link.
    router.replace(searchParams.get('from') ?? '/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <BITInput
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@uniride.app"
        prefixIcon={<MailIcon className="size-[17px]" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <BITInput
        label="Password"
        type="password"
        autoComplete="current-password"
        prefixIcon={<LockIcon className="size-[17px]" />}
        error={errors.password?.message}
        {...register('password')}
      />

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive-wash px-3 py-2.5 text-[13px] text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <SpinnerIcon className="size-4 animate-spin" />
            Signing in
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}

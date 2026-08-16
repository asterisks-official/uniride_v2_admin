'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { MAX_REJECTIONS, type Verification } from '@/apikit/verifications';
import { SpinnerIcon, WarningIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { rejectSchema, type RejectValues } from '../schemas/reject.schema';
import { attemptsLeft, isFinalRejection } from '../utils';

/**
 * Rejection is not a soft "not yet" — the third one suspends the account and
 * blocklists the applicant's email, student ID and phone from ever registering
 * again. An admin must not find that out afterwards, so the consequence is
 * stated on the button itself, not buried in help text.
 */
export function RejectDialog({
  verification,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  verification: Verification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note: string) => void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { note: '' },
  });

  if (!verification) return null;

  const isFinal = isFinalRejection(verification);
  const left = attemptsLeft(verification);

  function close(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={handleSubmit(({ note }) => onConfirm(note))}
          className="space-y-5"
        >
          <DialogHeader>
            <DialogTitle>
              Reject {verification.user.name}&rsquo;s application
            </DialogTitle>
            <DialogDescription>
              The applicant sees this reason and can correct their details.
            </DialogDescription>
          </DialogHeader>

          <div
            className={
              isFinal
                ? 'flex gap-3 rounded-lg border border-red-300 bg-red-50 p-3'
                : 'flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3'
            }
          >
            <WarningIcon
              className={
                isFinal
                  ? 'mt-0.5 size-4 shrink-0 text-red-600'
                  : 'mt-0.5 size-4 shrink-0 text-amber-600'
              }
            />
            <p
              className={
                isFinal
                  ? 'text-sm font-medium text-red-800'
                  : 'text-sm text-amber-800'
              }
            >
              {isFinal ? (
                <>
                  This is rejection {MAX_REJECTIONS} of {MAX_REJECTIONS}.
                  Confirming will <strong>block this account permanently</strong>{' '}
                  and stop this email, student ID and phone number from
                  registering again.
                </>
              ) : (
                <>
                  Rejection {verification.rejectionCount + 1} of {MAX_REJECTIONS}.
                  They will have {left - 1}{' '}
                  {left - 1 === 1 ? 'attempt' : 'attempts'} left after this.
                </>
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Reason</Label>
            <textarea
              id="note"
              rows={4}
              autoFocus
              placeholder="e.g. The licence photo is too blurry to read the expiry date."
              aria-invalid={Boolean(errors.note)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              {...register('note')}
            />
            {errors.note ? (
              <p className="text-sm text-red-600">{errors.note.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => close(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={
                isFinal
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }
              disabled={isPending}
            >
              {isPending ? <SpinnerIcon className="size-4 animate-spin" /> : null}
              {isFinal ? 'Reject and block account' : 'Reject application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

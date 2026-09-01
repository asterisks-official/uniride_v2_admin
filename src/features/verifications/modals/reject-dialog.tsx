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
import { Textarea } from '@/components/ui/textarea';

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
                ? 'flex gap-3 rounded-xl border border-destructive/35 bg-destructive-wash p-3.5'
                : 'flex gap-3 rounded-xl border border-warning/30 bg-warning-wash p-3.5'
            }
          >
            <WarningIcon
              className={
                isFinal
                  ? 'mt-0.5 size-4 shrink-0 text-destructive'
                  : 'mt-0.5 size-4 shrink-0 text-warning'
              }
            />
            <p
              className={
                isFinal
                  ? 'text-[13px] font-medium leading-relaxed text-destructive'
                  : 'text-[13px] leading-relaxed text-foreground'
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
            <Textarea
              id="note"
              rows={4}
              autoFocus
              placeholder="e.g. The licence photo is too blurry to read the expiry date."
              aria-invalid={Boolean(errors.note)}
              className="bg-card text-[13.5px]"
              {...register('note')}
            />
            {errors.note ? (
              <p className="text-[12.5px] text-destructive">{errors.note.message}</p>
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
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-warning text-white hover:bg-warning/90'
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

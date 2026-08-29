'use client';

import { useEffect, useState } from 'react';

import { SpinnerIcon } from '@/components/icons';
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

const MAX_REASON = 500;

/**
 * Suspending, and lifting a suspension.
 *
 * A suspended account cannot sign in at all, so the reason is not paperwork:
 * the login response shows it to the person, and it is the only explanation
 * they get. Lifting takes no reason, and clears the stored one.
 */
export function SuspendDialog({
  name,
  suspending,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  name: string | null;
  /** true = about to suspend, false = about to lift an existing suspension. */
  suspending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open, name, suspending]);

  if (!name) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {suspending ? `Suspend ${name}?` : `Lift suspension on ${name}?`}
          </DialogTitle>
          <DialogDescription>
            {suspending
              ? 'They will be signed out and unable to log in until this is lifted. Any ride they are currently on is not cancelled automatically.'
              : 'They will be able to sign in again immediately. The recorded reason is cleared.'}
          </DialogDescription>
        </DialogHeader>

        {suspending ? (
          <div className="space-y-2">
            <Label htmlFor="suspend-reason">Reason</Label>
            <textarea
              id="suspend-reason"
              value={reason}
              maxLength={MAX_REASON}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Why is this account being suspended?"
              className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-[12px] text-muted-foreground">
              Shown to the person when they try to sign in.{' '}
              <span className="tabular-nums">
                {reason.length}/{MAX_REASON}
              </span>
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={suspending ? 'destructive' : 'default'}
            onClick={() => onConfirm(reason.trim())}
            disabled={isPending}
          >
            {isPending ? (
              <SpinnerIcon className="mr-2 size-4 animate-spin" />
            ) : null}
            {suspending ? 'Suspend account' : 'Lift suspension'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

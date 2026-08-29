'use client';

import { useEffect, useState } from 'react';

import type { Report } from '@/apikit/reports';
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

import { typeLabel } from '../utils';

const MAX_NOTE = 500;

/**
 * Closing a report, in the two ways it can be closed.
 *
 * Resolve and dismiss are not the same act and must not read as one: resolving
 * says the report was upheld and acted on, dismissing says it was not upheld.
 * Both are final and both are attributed to the admin who pressed the button,
 * so the wording says which is which rather than leaving "close" to mean
 * whichever the reader assumed.
 */
export function ResolveDialog({
  report,
  action,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  report: Report | null;
  action: 'RESOLVE' | 'DISMISS';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note: string) => void;
  isPending: boolean;
}) {
  const [note, setNote] = useState('');

  // Cleared per report and per action, so a note written for one decision
  // cannot be submitted against a different one.
  useEffect(() => {
    if (open) setNote('');
  }, [open, report?.id, action]);

  if (!report) return null;

  const resolving = action === 'RESOLVE';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {resolving ? 'Resolve this report' : 'Dismiss this report'}
          </DialogTitle>
          <DialogDescription>
            {resolving
              ? `Marks the ${typeLabel(report.type).toLowerCase()} report against ${report.reported.name} as upheld and acted on.`
              : `Marks the ${typeLabel(report.type).toLowerCase()} report against ${report.reported.name} as not upheld. Nothing happens to their account.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="resolve-note">
            Note <span className="text-muted-foreground">(optional)</span>
          </Label>
          <textarea
            id="resolve-note"
            value={note}
            maxLength={MAX_NOTE}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={
              resolving
                ? 'What was done about it?'
                : 'Why was this not upheld?'
            }
            className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-[12px] text-muted-foreground">
            Recorded against the report and visible to other admins.{' '}
            <span className="tabular-nums">
              {note.length}/{MAX_NOTE}
            </span>
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={resolving ? 'default' : 'outline'}
            onClick={() => onConfirm(note.trim())}
            disabled={isPending}
          >
            {isPending ? <SpinnerIcon className="mr-2 size-4 animate-spin" /> : null}
            {resolving ? 'Resolve' : 'Dismiss'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

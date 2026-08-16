import { z } from 'zod';

export const rejectSchema = z.object({
  note: z
    .string()
    .trim()
    .min(10, 'Give a reason of at least 10 characters — the applicant sees this')
    .max(500, 'Keep it under 500 characters'),
});

export type RejectValues = z.infer<typeof rejectSchema>;

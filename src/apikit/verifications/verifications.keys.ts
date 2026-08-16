import type { VerificationsQuery } from './verifications.types';

export const verificationKeys = {
  all: ['verifications'] as const,
  lists: () => [...verificationKeys.all, 'list'] as const,
  list: (query: VerificationsQuery) =>
    [...verificationKeys.lists(), query] as const,
};

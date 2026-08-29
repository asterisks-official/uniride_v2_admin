import type { ReportsQuery } from './reports.types';

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (query: ReportsQuery) => [...reportKeys.lists(), query] as const,
};

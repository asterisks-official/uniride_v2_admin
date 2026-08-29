export const uploadKeys = {
  all: ['uploads'] as const,
  views: () => [...uploadKeys.all, 'view'] as const,
  /** Keyed on the stored URL, so two tiles showing the same document share one signature. */
  view: (key: string) => [...uploadKeys.views(), key] as const,
};

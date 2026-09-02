import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UniRide — university ride sharing',
  description:
    'UniRide matches students who need a lift with verified student riders on their own campus. Fares are set before you book, and every trip is recorded.',
  openGraph: {
    title: 'UniRide — university ride sharing',
    description:
      'Campus rides between students you can verify. Fares set before you book.',
    url: 'https://uniridebd.com',
    siteName: 'UniRide',
    type: 'website',
  },
};

/**
 * The public shell.
 *
 * Its own route group so the marketing page shares nothing with the console —
 * no sidebar, no query client, no session lookup. A visitor who never signs in
 * should not be paying for the dashboard's providers.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="ur-landing">{children}</div>;
}

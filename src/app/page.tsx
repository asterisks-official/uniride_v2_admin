import { redirect } from 'next/navigation';

/** Nothing lives at the root; middleware decides where they end up. */
export default function RootPage() {
  redirect('/dashboard');
}

import { Suspense } from 'react';
import { PublicStorefront } from '@/components/PublicStorefront';

export const metadata = { title: 'Local service professionals' };

export default function Page() {
  return (
    <Suspense fallback={<main className="public-storefront-loading">Loading business...</main>}>
      <PublicStorefront />
    </Suspense>
  );
}

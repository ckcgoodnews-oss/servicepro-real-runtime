import { TrialMarketplaceSelector } from '@/components/TrialMarketplaceSelector';

export const metadata = { title: 'Choose your services — ServicePro Trial' };

export default function TrialSelectPage() {
  return (
    <main className="workspace trial-select-page">
      <TrialMarketplaceSelector />
    </main>
  );
}

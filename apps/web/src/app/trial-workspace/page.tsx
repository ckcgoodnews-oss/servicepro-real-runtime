import { TrialSiteDashboard } from '@/components/TrialSiteDashboard';

export const metadata = { title: 'Your trial workspace — ServicePro' };

export default function TrialWorkspacePage() {
  return (
    <main className="workspace">
      <TrialSiteDashboard />
    </main>
  );
}

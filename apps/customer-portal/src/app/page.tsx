'use client';

import { PortalShell } from '@/components/PortalShell';
import { DashboardView } from '@/components/DashboardView';

export default function CustomerPortalHome() {
  return (
    <PortalShell activePath="/dashboard">
      <DashboardView />
    </PortalShell>
  );
}

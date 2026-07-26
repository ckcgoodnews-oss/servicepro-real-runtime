'use client';

import { MobileShell } from '@/components/MobileShell';
import { TodaysJobs } from '@/components/TodaysJobs';

export default function MobileHome() {
  return (
    <MobileShell activePath="/" title="Today">
      <TodaysJobs />
    </MobileShell>
  );
}

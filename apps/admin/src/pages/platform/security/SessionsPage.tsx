// Platform Administration > Security > Sessions
// Active impersonation sessions with emergency terminate capability.

export type ImpersonationSession = {
  id: string;
  adminUserId: string;
  adminEmail: string;
  targetTenantId: string;
  targetOwnerId: string;
  targetOwnerEmail: string;
  mode: 'full' | 'read_only';
  startedAt: string;
  endedAt: string;
  endedReason: string;
};

export type SessionsPageProps = {
  sessions: ImpersonationSession[];
  activeCount: number;
};

export function SessionsPage(props: SessionsPageProps) {
  return {
    component: 'SessionsPage',
    sessions: props.sessions,
    activeCount: props.activeCount,
    columns: [
      { key: 'adminEmail', label: 'Admin', sortable: true },
      { key: 'targetOwnerEmail', label: 'Impersonating', sortable: true },
      { key: 'targetTenantId', label: 'Tenant' },
      { key: 'mode', label: 'Mode', type: 'badge' },
      { key: 'startedAt', label: 'Started', sortable: true, format: 'datetime' },
      { key: 'endedAt', label: 'Ended', format: 'datetime' },
      { key: 'endedReason', label: 'Reason' },
      { key: 'actions', label: '', type: 'actions' }
    ],
    actions: [
      { key: 'end', label: 'End Session', endpoint: 'POST /api/v1/platform/tmc/impersonation/sessions/:id/end', showWhen: 'active' }
    ],
    emergencyAction: {
      label: 'Terminate All Sessions for Tenant',
      endpoint: 'POST /api/v1/platform/tmc/:tenantId/impersonation/terminate-all',
      confirm: true,
      confirmMessage: 'This will immediately end ALL active impersonation sessions for this tenant.'
    },
    listEndpoint: 'GET /api/v1/platform/tmc/impersonation/sessions'
  };
}

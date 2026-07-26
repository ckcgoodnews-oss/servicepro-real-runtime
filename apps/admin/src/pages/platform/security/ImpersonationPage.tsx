// Platform Administration > Security > Impersonation
// "Login as Owner" functionality with full audit trail.

export type ImpersonationTarget = {
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  tenantId: string;
  tenantName: string;
  roles: string[];
};

export type ImpersonationPageProps = {
  targets: ImpersonationTarget[];
  selectedTenantId?: string;
  activeSession?: {
    sessionId: string;
    targetEmail: string;
    mode: string;
    startedAt: string;
  };
};

export function ImpersonationPage(props: ImpersonationPageProps) {
  return {
    component: 'ImpersonationPage',
    targets: props.targets,
    selectedTenantId: props.selectedTenantId,
    activeSession: props.activeSession,
    columns: [
      { key: 'ownerEmail', label: 'Owner Email', sortable: true },
      { key: 'ownerName', label: 'Name', sortable: true },
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'roles', label: 'Roles', type: 'badges' },
      { key: 'actions', label: '', type: 'actions' }
    ],
    actions: [
      { key: 'impersonate-full', label: 'Login as Owner (Full Access)', mode: 'full' },
      { key: 'impersonate-readonly', label: 'Login as Owner (Read-Only)', mode: 'read_only' }
    ],
    startEndpoint: 'POST /api/v1/platform/tmc/:tenantId/impersonation/owners/:ownerId/start',
    endEndpoint: 'POST /api/v1/platform/tmc/impersonation/sessions/:sessionId/end',
    impersonationBanner: {
      message: 'You are currently impersonating {ownerEmail} on tenant {tenantId}',
      style: 'warning',
      showEndButton: true
    },
    safeguards: [
      'All actions during impersonation are logged to the audit trail',
      'Impersonation sessions auto-expire after 1 hour',
      'Platform admins can terminate any session immediately',
      'Read-only mode prevents any write operations'
    ]
  };
}

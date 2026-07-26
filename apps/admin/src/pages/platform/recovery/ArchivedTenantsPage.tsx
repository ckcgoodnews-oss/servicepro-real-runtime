// Platform Administration > Recovery > Archived Tenants
// View and restore archived/deleted tenants. Permanent purge.

export type ArchivedTenant = {
  tenantId: string;
  tenantName: string;
  status: 'archived' | 'deleted' | 'purged';
  archivedAt: string;
  deletedAt: string;
  permanentlyPurgedAt?: string;
  lastActiveAt?: string;
};

export type ArchivedTenantsPageProps = {
  tenants: ArchivedTenant[];
};

export function ArchivedTenantsPage(props: ArchivedTenantsPageProps) {
  return {
    component: 'ArchivedTenantsPage',
    tenants: props.tenants,
    columns: [
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'status', label: 'Status', type: 'status-badge' },
      { key: 'archivedAt', label: 'Archived', sortable: true, format: 'date' },
      { key: 'deletedAt', label: 'Deleted', sortable: true, format: 'date' },
      { key: 'actions', label: '', type: 'actions' }
    ],
    actions: [
      { key: 'restore', label: 'Restore', endpoint: 'POST /api/v1/platform/tenant-management/:tenantId/restore', showWhen: 'not-purged' },
      { key: 'purge', label: 'Permanent Purge', endpoint: 'POST /api/v1/platform/tmc/:tenantId/purge', destructive: true, confirm: true,
        confirmMessage: 'IRREVERSIBLE: This will permanently delete ALL tenant data including users, customers, jobs, and assets. This cannot be undone.' }
    ],
    statusDescriptions: {
      archived: 'Tenant is archived but data is preserved. Can be restored.',
      deleted: 'Tenant is soft-deleted. Can be restored or permanently purged.',
      purged: 'Tenant data has been permanently removed. Cannot be recovered.'
    },
    dataEndpoint: 'GET /api/v1/platform/tmc/recovery/tenants'
  };
}

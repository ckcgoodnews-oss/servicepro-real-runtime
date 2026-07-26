// Platform Administration > Tenant Management > Owners
// View and manage all tenant owners. Transfer, soft-delete, restore.

export type OwnerRecord = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  tenantId: string;
  tenantName: string;
  deletedAt: string;
  createdAt: string;
};

export type OwnersPageProps = {
  owners: OwnerRecord[];
  selectedTenantId?: string;
};

export function OwnersPage(props: OwnersPageProps) {
  return {
    component: 'OwnersPage',
    owners: props.owners,
    selectedTenantId: props.selectedTenantId,
    columns: [
      { key: 'email', label: 'Email', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'roles', label: 'Roles', type: 'badges' },
      { key: 'deletedAt', label: 'Status', type: 'status-indicator' },
      { key: 'actions', label: '', type: 'actions' }
    ],
    actions: [
      { key: 'impersonate', label: 'Login as Owner', endpoint: 'POST /api/v1/platform/tmc/:tenantId/impersonation/owners/:ownerId/start' },
      { key: 'transfer', label: 'Transfer to Tenant', endpoint: 'POST /api/v1/platform/tmc/transfer-owner' },
      { key: 'soft-delete', label: 'Soft Delete', endpoint: 'POST /api/v1/platform/tenant-management/:tenantId/owners/:ownerId/soft-delete', destructive: true },
      { key: 'restore', label: 'Restore', endpoint: 'POST /api/v1/platform/tenant-management/:tenantId/owners/:ownerId/restore', showWhen: 'deleted' }
    ],
    transferDialog: {
      fields: [
        { key: 'ownerId', label: 'Owner ID', type: 'hidden' },
        { key: 'fromTenantId', label: 'From Tenant', type: 'hidden' },
        { key: 'toTenantId', label: 'Destination Tenant', type: 'tenant-select', required: true }
      ],
      endpoint: 'POST /api/v1/platform/tmc/transfer-owner'
    }
  };
}

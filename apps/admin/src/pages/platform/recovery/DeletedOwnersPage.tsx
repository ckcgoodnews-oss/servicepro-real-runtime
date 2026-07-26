// Platform Administration > Recovery > Deleted Owners
// View and restore soft-deleted owner accounts.

export type DeletedOwner = {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tenantName: string;
  deletedAt: string;
};

export type DeletedOwnersPageProps = {
  owners: DeletedOwner[];
  selectedTenantId?: string;
};

export function DeletedOwnersPage(props: DeletedOwnersPageProps) {
  return {
    component: 'DeletedOwnersPage',
    owners: props.owners,
    selectedTenantId: props.selectedTenantId,
    columns: [
      { key: 'email', label: 'Email', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'deletedAt', label: 'Deleted', sortable: true, format: 'date' },
      { key: 'actions', label: '', type: 'actions' }
    ],
    actions: [
      { key: 'restore', label: 'Restore Owner', endpoint: 'POST /api/v1/platform/tenant-management/:tenantId/owners/:ownerId/restore' }
    ],
    dataEndpoint: 'GET /api/v1/platform/tmc/:tenantId/deleted-owners'
  };
}

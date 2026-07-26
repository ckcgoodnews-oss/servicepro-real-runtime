// Platform Administration > Recovery > Restore
// Unified restore interface for tenants, owners, and associated data.

export type RestoreCandidate = {
  type: 'tenant' | 'owner';
  id: string;
  label: string;
  tenantId: string;
  tenantName: string;
  deletedAt: string;
  restorable: boolean;
  reason?: string;
};

export type RestorePageProps = {
  candidates: RestoreCandidate[];
  recentRestores: Array<{ type: string; id: string; label: string; restoredAt: string; restoredBy: string }>;
};

export function RestorePage(props: RestorePageProps) {
  return {
    component: 'RestorePage',
    candidates: props.candidates,
    recentRestores: props.recentRestores,
    sections: [
      {
        key: 'tenants',
        label: 'Deleted Tenants',
        filter: (c: RestoreCandidate) => c.type === 'tenant',
        restoreEndpoint: 'POST /api/v1/platform/tenant-management/:tenantId/restore'
      },
      {
        key: 'owners',
        label: 'Deleted Owners',
        filter: (c: RestoreCandidate) => c.type === 'owner',
        restoreEndpoint: 'POST /api/v1/platform/tenant-management/:tenantId/owners/:ownerId/restore'
      }
    ],
    columns: [
      { key: 'type', label: 'Type', type: 'badge' },
      { key: 'label', label: 'Name/Email', sortable: true },
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'deletedAt', label: 'Deleted', sortable: true, format: 'date' },
      { key: 'restorable', label: 'Restorable', type: 'boolean-indicator' },
      { key: 'actions', label: '', type: 'actions' }
    ],
    actions: [
      { key: 'restore', label: 'Restore', showWhen: 'restorable' }
    ],
    recentColumns: [
      { key: 'type', label: 'Type' },
      { key: 'label', label: 'Item' },
      { key: 'restoredAt', label: 'Restored', format: 'datetime' },
      { key: 'restoredBy', label: 'Restored By' }
    ]
  };
}

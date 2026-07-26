// Platform Administration > Tenant Management > Tenants
// Full CRUD interface for tenant records with bulk operations.

export type TenantRecord = {
  tenantId: string;
  name: string;
  status: string;
  plan: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionSeats: number;
  tags: string[];
  notes: string;
  featureFlags: Record<string, boolean>;
  storageBytes: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string;
  deletedAt: string;
};

export type TenantsListPageProps = {
  tenants: TenantRecord[];
  selectedIds: string[];
  bulkActions: Array<{ key: string; label: string }>;
};

export function TenantsListPage(props: TenantsListPageProps) {
  return {
    component: 'TenantsListPage',
    tenants: props.tenants,
    selectedIds: props.selectedIds,
    bulkActions: [
      { key: 'activate', label: 'Set Active', endpoint: 'POST /api/v1/platform/tmc/bulk-status', body: { status: 'active' } },
      { key: 'suspend', label: 'Suspend', endpoint: 'POST /api/v1/platform/tmc/bulk-status', body: { status: 'suspended' } },
      { key: 'archive', label: 'Archive', endpoint: 'POST /api/v1/platform/tmc/bulk-status', body: { status: 'archived' } },
      { key: 'delete', label: 'Soft Delete', endpoint: 'POST /api/v1/platform/tmc/bulk-status', body: { status: 'deleted' }, confirm: true }
    ],
    createForm: {
      fields: [
        { key: 'name', label: 'Tenant Name', type: 'text', required: true },
        { key: 'tenantId', label: 'Tenant Key (auto-generated if blank)', type: 'text' },
        { key: 'plan', label: 'Plan', type: 'select', options: ['free', 'starter', 'professional', 'enterprise'] },
        { key: 'seats', label: 'Seats', type: 'number', default: 5 },
        { key: 'tags', label: 'Tags', type: 'tag-input' },
        { key: 'notes', label: 'Notes', type: 'textarea' }
      ],
      endpoint: 'POST /api/v1/platform/tmc/tenants'
    }
  };
}

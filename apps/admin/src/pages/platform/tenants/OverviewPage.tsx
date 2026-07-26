// Platform Administration > Tenant Management > Overview
// Summary view of all tenants with status breakdown and search.

export type TenantSummary = {
  tenantId: string;
  name: string;
  status: string;
  plan: string;
  owners: number;
  users: number;
  healthScore: number;
  createdAt: string;
};

export type TenantsOverviewPageProps = {
  tenants: TenantSummary[];
  statusCounts: Record<string, number>;
  filters: { status?: string; search?: string; plan?: string };
};

export function TenantsOverviewPage(props: TenantsOverviewPageProps) {
  return {
    component: 'TenantsOverviewPage',
    tenants: props.tenants,
    statusCounts: props.statusCounts,
    filters: props.filters,
    columns: [
      { key: 'name', label: 'Tenant Name', sortable: true },
      { key: 'status', label: 'Status', sortable: true, filterable: true },
      { key: 'plan', label: 'Plan', sortable: true },
      { key: 'owners', label: 'Owners', sortable: true },
      { key: 'users', label: 'Users', sortable: true },
      { key: 'healthScore', label: 'Health', sortable: true },
      { key: 'createdAt', label: 'Created', sortable: true },
      { key: 'actions', label: '', type: 'actions' }
    ],
    actions: [
      { key: 'view', label: 'View Details' },
      { key: 'edit', label: 'Edit' },
      { key: 'impersonate', label: 'Login as Owner' },
      { key: 'archive', label: 'Archive', destructive: true },
      { key: 'soft-delete', label: 'Soft Delete', destructive: true }
    ]
  };
}

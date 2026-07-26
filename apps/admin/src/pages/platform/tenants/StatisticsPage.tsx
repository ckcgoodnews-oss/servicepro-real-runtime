// Platform Administration > Tenant Management > Statistics
// Usage statistics across tenants: users, customers, jobs, logins.

export type TenantStatistics = {
  tenantId: string;
  tenantName: string;
  usersCount: number;
  customersCount: number;
  jobsCount: number;
  assetsCount: number;
  loginCount: number;
  errorCount: number;
  storageBytes: number;
  snapshotAt: string;
};

export type StatisticsPageProps = {
  tenants: TenantStatistics[];
  aggregates: {
    totalUsers: number;
    totalCustomers: number;
    totalJobs: number;
    totalAssets: number;
    totalLogins: number;
    totalErrors: number;
  };
};

export function StatisticsPage(props: StatisticsPageProps) {
  return {
    component: 'StatisticsPage',
    tenants: props.tenants,
    aggregates: props.aggregates,
    columns: [
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'usersCount', label: 'Users', sortable: true },
      { key: 'customersCount', label: 'Customers', sortable: true },
      { key: 'jobsCount', label: 'Jobs', sortable: true },
      { key: 'assetsCount', label: 'Assets', sortable: true },
      { key: 'loginCount', label: 'Logins', sortable: true },
      { key: 'errorCount', label: 'Errors', sortable: true, highlight: 'danger' }
    ],
    charts: [
      { key: 'users-by-tenant', type: 'bar', dataKey: 'usersCount', label: 'Users by Tenant' },
      { key: 'activity-trend', type: 'line', dataKey: 'loginCount', label: 'Login Activity' }
    ],
    dataEndpoint: 'GET /api/v1/platform/tmc/:tenantId/usage'
  };
}

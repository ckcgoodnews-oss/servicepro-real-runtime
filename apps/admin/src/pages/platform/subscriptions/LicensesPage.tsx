// Platform Administration > Subscription Management > Licenses
// Per-tenant license enforcement: seat usage, overages, limits.

export type LicenseInfo = {
  tenantId: string;
  tenantName: string;
  plan: string;
  seats: number;
  usedSeats: number;
  usageLimits: {
    maxUsers?: number;
    maxCustomers?: number;
    maxStorageBytes?: number;
    maxApiCallsPerMonth?: number;
    maxWorkOrders?: number;
  };
  currentUsage: {
    users: number;
    customers: number;
    storageBytes: number;
    apiCalls: number;
    workOrders: number;
  };
  overages: string[];
};

export type LicensesPageProps = {
  licenses: LicenseInfo[];
};

export function LicensesPage(props: LicensesPageProps) {
  return {
    component: 'LicensesPage',
    licenses: props.licenses,
    columns: [
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'plan', label: 'Plan', type: 'badge' },
      { key: 'seats', label: 'Seat Limit', sortable: true },
      { key: 'usedSeats', label: 'Used', sortable: true },
      { key: 'overages', label: 'Overages', type: 'warning-list' }
    ],
    editForm: {
      fields: [
        { key: 'usageLimits.maxUsers', label: 'Max Users', type: 'number' },
        { key: 'usageLimits.maxCustomers', label: 'Max Customers', type: 'number' },
        { key: 'usageLimits.maxStorageBytes', label: 'Max Storage (bytes)', type: 'number' },
        { key: 'usageLimits.maxApiCallsPerMonth', label: 'Max API Calls/Month', type: 'number' },
        { key: 'usageLimits.maxWorkOrders', label: 'Max Work Orders', type: 'number' }
      ],
      endpoint: 'PATCH /api/v1/platform/tmc/:tenantId/subscription'
    }
  };
}

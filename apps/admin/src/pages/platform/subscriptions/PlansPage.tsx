// Platform Administration > Subscription Management > Plans
// View/edit subscription plans per tenant. Assign plans, set seats.

export type TenantPlan = {
  tenantId: string;
  tenantName: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionSeats: number;
  subscriptionStartedAt: string;
  subscriptionExpiresAt: string;
  billingProvider: string;
  billingExternalId: string;
};

export type PlansPageProps = {
  tenants: TenantPlan[];
  availablePlans: string[];
};

export function PlansPage(props: PlansPageProps) {
  return {
    component: 'PlansPage',
    tenants: props.tenants,
    availablePlans: props.availablePlans || ['free', 'starter', 'professional', 'enterprise', 'custom'],
    columns: [
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'subscriptionPlan', label: 'Plan', sortable: true, type: 'badge' },
      { key: 'subscriptionStatus', label: 'Status', type: 'status-badge' },
      { key: 'subscriptionSeats', label: 'Seats', sortable: true },
      { key: 'subscriptionExpiresAt', label: 'Expires', sortable: true, format: 'date' },
      { key: 'billingProvider', label: 'Provider' },
      { key: 'actions', label: '', type: 'actions' }
    ],
    editForm: {
      fields: [
        { key: 'subscriptionPlan', label: 'Plan', type: 'select', options: ['free', 'starter', 'professional', 'enterprise', 'custom'] },
        { key: 'subscriptionStatus', label: 'Status', type: 'select', options: ['active', 'trialing', 'past_due', 'canceled', 'suspended'] },
        { key: 'subscriptionSeats', label: 'Seat Limit', type: 'number' },
        { key: 'subscriptionExpiresAt', label: 'Expiration', type: 'datetime' },
        { key: 'billingProvider', label: 'Billing Provider', type: 'select', options: ['manual', 'stripe', 'paypal', 'invoice'] },
        { key: 'billingExternalId', label: 'External ID', type: 'text' },
        { key: 'billingEmail', label: 'Billing Email', type: 'email' }
      ],
      endpoint: 'PATCH /api/v1/platform/tmc/:tenantId/subscription'
    }
  };
}

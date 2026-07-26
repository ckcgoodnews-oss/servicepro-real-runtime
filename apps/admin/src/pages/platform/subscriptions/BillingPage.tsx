// Platform Administration > Subscription Management > Billing
// Billing event history, payment tracking, invoice records.

export type BillingEvent = {
  id: string;
  tenantId: string;
  tenantName: string;
  eventType: string;
  amountCents: number;
  currency: string;
  description: string;
  externalId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type BillingPageProps = {
  events: BillingEvent[];
  selectedTenantId?: string;
  summary: {
    totalRevenue: number;
    mtdRevenue: number;
    outstandingBalance: number;
    currency: string;
  };
};

export function BillingPage(props: BillingPageProps) {
  return {
    component: 'BillingPage',
    events: props.events,
    selectedTenantId: props.selectedTenantId,
    summary: props.summary,
    columns: [
      { key: 'createdAt', label: 'Date', sortable: true, format: 'datetime' },
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'eventType', label: 'Type', type: 'badge' },
      { key: 'amountCents', label: 'Amount', sortable: true, format: 'currency' },
      { key: 'description', label: 'Description' },
      { key: 'externalId', label: 'External Ref' }
    ],
    eventTypes: ['charge', 'payment', 'refund', 'credit', 'adjustment', 'subscription_renewal', 'overage'],
    addForm: {
      fields: [
        { key: 'tenantId', label: 'Tenant', type: 'tenant-select', required: true },
        { key: 'eventType', label: 'Event Type', type: 'select', options: ['charge', 'payment', 'refund', 'credit', 'adjustment'] },
        { key: 'amountCents', label: 'Amount (cents)', type: 'number', required: true },
        { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'], default: 'USD' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'externalId', label: 'External Reference', type: 'text' }
      ],
      endpoint: 'POST /api/v1/platform/tmc/:tenantId/billing/events'
    }
  };
}

export type DomainEvent<TPayload = Record<string, unknown>> = {
  eventId: string;
  tenantId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: TPayload;
  occurredAt: string;
};

export const DOMAIN_EVENTS = {
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  JOB_CREATED: 'job.created',
  JOB_STATUS_CHANGED: 'job.status_changed',
  ESTIMATE_CREATED: 'estimate.created',
  ESTIMATE_APPROVED: 'estimate.approved',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAID: 'invoice.paid',
  DISPATCH_ASSIGNED: 'dispatch.assigned'
} as const;

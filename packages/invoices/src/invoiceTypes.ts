import { EntityAuditFields, Money } from '../../types/src/core';
import { PriceLineInput } from '../../pricing/src/pricingTypes';

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'void';

export type Invoice = EntityAuditFields & {
  id: string;
  tenantId: string;
  customerId: string;
  jobId?: string;
  status: InvoiceStatus;
  lines: PriceLineInput[];
  total: Money;
  balanceDue: Money;
};

export type CreateInvoiceInput = {
  customerId: string;
  jobId?: string;
  lines: PriceLineInput[];
  taxRate: number;
};

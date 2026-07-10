import { EntityAuditFields, Money } from '../../types/src/core';
import { PriceLineInput } from '../../pricing/src/pricingTypes';

export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'declined' | 'expired';

export type Estimate = EntityAuditFields & {
  id: string;
  tenantId: string;
  customerId: string;
  jobId?: string;
  status: EstimateStatus;
  lines: PriceLineInput[];
  total: Money;
  approvedAt?: string;
};

export type CreateEstimateInput = {
  customerId: string;
  jobId?: string;
  lines: PriceLineInput[];
  taxRate: number;
};

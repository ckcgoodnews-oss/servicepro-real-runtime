import { EntityAuditFields, ServiceAddress } from '../../types/src/core';

export type CustomerStatus = 'active' | 'inactive' | 'prospect';

export type Customer = EntityAuditFields & {
  id: string;
  tenantId: string;
  status: CustomerStatus;
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  billingAddress?: ServiceAddress;
  serviceAddress?: ServiceAddress;
  notes?: string;
};

export type CreateCustomerInput = {
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  serviceAddress?: ServiceAddress;
  notes?: string;
};

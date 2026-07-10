import { EntityAuditFields, Money, ServiceAddress } from '../../types/src/core';

export type JobStatus = 'open' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type JobPriority = 'low' | 'normal' | 'high' | 'emergency';

export type Job = EntityAuditFields & {
  id: string;
  tenantId: string;
  customerId?: string;
  title: string;
  description?: string;
  status: JobStatus;
  priority: JobPriority;
  serviceAddress?: ServiceAddress;
  scheduledStart?: string;
  scheduledEnd?: string;
  assignedTechnicianId?: string;
  estimatedPrice?: Money;
  finalPrice?: Money;
};

export type CreateJobInput = {
  customerId?: string;
  title: string;
  description?: string;
  priority?: JobPriority;
  serviceAddress?: ServiceAddress;
  scheduledStart?: string;
  scheduledEnd?: string;
};

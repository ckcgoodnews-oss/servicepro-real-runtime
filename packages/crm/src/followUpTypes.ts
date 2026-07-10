export type FollowUpReason =
  | 'new_lead'
  | 'estimate_sent'
  | 'job_completed'
  | 'invoice_overdue'
  | 'maintenance_due'
  | 'review_request'
  | 'membership_renewal';

export type FollowUpTask = {
  id: string;
  tenantId: string;
  customerId?: string;
  leadId?: string;
  reason: FollowUpReason;
  dueAt: string;
  assignedUserId?: string;
  status: 'open' | 'completed' | 'snoozed' | 'cancelled';
  notes?: string;
};

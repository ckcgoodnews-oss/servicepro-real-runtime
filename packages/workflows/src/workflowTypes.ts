export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

export type WorkflowDefinition = {
  id: string;
  tenantId: string;
  name: string;
  status: WorkflowStatus;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
};

export type WorkflowTrigger = {
  triggerType:
    | 'lead.created'
    | 'estimate.sent'
    | 'job.completed'
    | 'invoice.overdue'
    | 'customer.created'
    | 'schedule.time';
  configuration: Record<string, unknown>;
};

export type WorkflowAction = {
  actionType:
    | 'send.email'
    | 'send.sms'
    | 'create.follow_up'
    | 'assign.user'
    | 'update.lead_score'
    | 'create.review_request'
    | 'webhook.post';
  configuration: Record<string, unknown>;
};

import { WorkflowDefinition } from './workflowTypes';

export type WorkflowExecutionContext = {
  tenantId: string;
  triggerEventId: string;
  payload: Record<string, unknown>;
};

export type WorkflowExecutionResult = {
  workflowId: string;
  status: 'completed' | 'failed' | 'skipped';
  actionResults: Array<{
    actionType: string;
    status: 'completed' | 'failed' | 'skipped';
    message?: string;
  }>;
};

export interface WorkflowExecutor {
  execute(workflow: WorkflowDefinition, context: WorkflowExecutionContext): Promise<WorkflowExecutionResult>;
}

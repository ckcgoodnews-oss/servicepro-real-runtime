const { makeId, now } = require('../services/id');

function createAutomationRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    listWorkflows(tenantId, filters = {}) {
      const d = data();
      d.automationWorkflows ||= [];
      let results = d.automationWorkflows.filter(w => w.tenantId === tenantId);
      if (filters.status) results = results.filter(w => w.status === filters.status);
      if (filters.trigger) results = results.filter(w => w.trigger === filters.trigger);
      return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    findWorkflowById(tenantId, id) {
      const d = data();
      d.automationWorkflows ||= [];
      return d.automationWorkflows.find(w => w.tenantId === tenantId && w.id === id) || null;
    },

    createWorkflow(tenantId, input) {
      const d = data();
      d.automationWorkflows ||= [];
      if (!input.name) { const err = new Error('Workflow name is required'); err.status = 400; err.code = 'validation_failed'; throw err; }
      const workflow = {
        id: makeId('wf'),
        tenantId,
        name: input.name,
        description: input.description || '',
        trigger: input.trigger || 'manual',
        triggerConfig: input.triggerConfig || {},
        steps: input.steps || [],
        status: 'draft',
        executionCount: 0,
        lastExecutedAt: '',
        createdBy: input.createdBy || '',
        createdAt: now(),
        updatedAt: now()
      };
      d.automationWorkflows.push(workflow);
      save(d);
      return workflow;
    },

    updateWorkflow(tenantId, id, input) {
      const d = data();
      d.automationWorkflows ||= [];
      const workflow = d.automationWorkflows.find(w => w.tenantId === tenantId && w.id === id);
      if (!workflow) return null;
      for (const key of ['name', 'description', 'trigger', 'triggerConfig', 'steps', 'status']) {
        if (input[key] !== undefined) workflow[key] = input[key];
      }
      workflow.updatedAt = now();
      save(d);
      return workflow;
    },

    deleteWorkflow(tenantId, id) {
      const d = data();
      d.automationWorkflows ||= [];
      const idx = d.automationWorkflows.findIndex(w => w.tenantId === tenantId && w.id === id);
      if (idx < 0) return null;
      return d.automationWorkflows.splice(idx, 1)[0];
    },

    executeWorkflow(tenantId, id, context = {}) {
      const d = data();
      d.automationWorkflows ||= [];
      d.automationExecutions ||= [];
      const workflow = d.automationWorkflows.find(w => w.tenantId === tenantId && w.id === id);
      if (!workflow) return null;
      if (workflow.status !== 'active') { const err = new Error('Workflow must be active to execute'); err.status = 400; err.code = 'invalid_state'; throw err; }

      const execution = {
        id: makeId('exec'),
        tenantId,
        workflowId: id,
        workflowName: workflow.name,
        trigger: workflow.trigger,
        status: 'completed',
        stepsExecuted: workflow.steps.length,
        stepResults: workflow.steps.map((step, i) => ({ stepIndex: i, action: step.action, status: 'completed', executedAt: now() })),
        context,
        startedAt: now(),
        completedAt: now()
      };
      d.automationExecutions.push(execution);
      workflow.executionCount = (workflow.executionCount || 0) + 1;
      workflow.lastExecutedAt = now();
      save(d);
      return execution;
    },

    listExecutions(tenantId, workflowId) {
      const d = data();
      d.automationExecutions ||= [];
      let results = d.automationExecutions.filter(e => e.tenantId === tenantId);
      if (workflowId) results = results.filter(e => e.workflowId === workflowId);
      return results.sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 100);
    },

    getAvailableTriggers() {
      return [
        { key: 'manual', label: 'Manual Trigger', description: 'Run manually by a user' },
        { key: 'job_created', label: 'Job Created', description: 'When a new work order is created' },
        { key: 'job_completed', label: 'Job Completed', description: 'When a work order is marked complete' },
        { key: 'invoice_created', label: 'Invoice Created', description: 'When an invoice is generated' },
        { key: 'invoice_overdue', label: 'Invoice Overdue', description: 'When an invoice passes its due date' },
        { key: 'customer_created', label: 'Customer Created', description: 'When a new customer is added' },
        { key: 'lead_stage_changed', label: 'Lead Stage Changed', description: 'When a CRM lead moves stages' },
        { key: 'appointment_booked', label: 'Appointment Booked', description: 'When a customer books an appointment' },
        { key: 'schedule', label: 'Scheduled', description: 'Run on a recurring schedule' }
      ];
    },

    getAvailableActions() {
      return [
        { key: 'send_email', label: 'Send Email', category: 'notification' },
        { key: 'send_sms', label: 'Send SMS', category: 'notification' },
        { key: 'create_task', label: 'Create Task', category: 'operations' },
        { key: 'assign_technician', label: 'Assign Technician', category: 'dispatch' },
        { key: 'update_status', label: 'Update Status', category: 'operations' },
        { key: 'create_invoice', label: 'Create Invoice', category: 'billing' },
        { key: 'add_note', label: 'Add Note', category: 'documentation' },
        { key: 'webhook', label: 'Call Webhook', category: 'integration' },
        { key: 'delay', label: 'Wait/Delay', category: 'flow' },
        { key: 'condition', label: 'If/Else Condition', category: 'flow' }
      ];
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store);
}

module.exports = { createAutomationRepository };

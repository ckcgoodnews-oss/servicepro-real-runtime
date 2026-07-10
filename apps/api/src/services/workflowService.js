const { validationError, conflictError } = require('../errors/domainError');

const DEFAULT_JOB_WORKFLOW = {
  entityType: 'job',
  states: ['open', 'scheduled', 'dispatched', 'in_progress', 'completed', 'invoiced', 'closed', 'cancelled'],
  transitions: {
    open: ['scheduled', 'dispatched', 'cancelled'],
    scheduled: ['dispatched', 'in_progress', 'cancelled'],
    dispatched: ['in_progress', 'completed', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: ['invoiced', 'closed'],
    invoiced: ['closed'],
    closed: [],
    cancelled: []
  }
};

function defaultWorkflowRules(tenantId = 'tenant_demo') {
  const stamp = new Date().toISOString();
  return {
    tenantId,
    entityType: 'job',
    name: 'Default Job Workflow',
    active: true,
    definition: DEFAULT_JOB_WORKFLOW,
    createdAt: stamp,
    updatedAt: stamp
  };
}

function allowedTransitions(definition, fromStatus) {
  const transitions = definition && definition.transitions ? definition.transitions : {};
  return transitions[fromStatus] || [];
}

function validateTransition(definition, fromStatus, toStatus) {
  if (!fromStatus || !toStatus) throw validationError('fromStatus and toStatus are required');
  if (fromStatus === toStatus) return true;

  const allowed = allowedTransitions(definition, fromStatus);
  if (!allowed.includes(toStatus)) {
    throw conflictError(`Invalid workflow transition from ${fromStatus} to ${toStatus}`, {
      fromStatus,
      toStatus,
      allowed
    });
  }

  return true;
}

function transitionJob(job, toStatus) {
  validateTransition(DEFAULT_JOB_WORKFLOW, job.status, toStatus);
  return {
    ...job,
    status: toStatus,
    updatedAt: new Date().toISOString()
  };
}

module.exports = {
  DEFAULT_JOB_WORKFLOW,
  defaultWorkflowRules,
  allowedTransitions,
  validateTransition,
  transitionJob
};

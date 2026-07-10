const fs = require('fs');

const required = [
  'apps/api/src/services/workflowService.js',
  'apps/api/src/repositories/workflowRepository.js',
  'apps/api/src/routes/workflows.js',
  'scripts/seed-workflow-rules.js',
  'packages/database/postgres/075_workflow_runtime.sql',
  'docs/sprint75-workflow-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 75 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint75.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-75';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { DEFAULT_JOB_WORKFLOW, allowedTransitions, validateTransition } = require('../apps/api/src/services/workflowService');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const allowed = allowedTransitions(DEFAULT_JOB_WORKFLOW, 'open');
if (!allowed.includes('scheduled')) {
  console.error('Default workflow transition missing.');
  process.exit(1);
}

let invalidRejected = false;
try {
  validateTransition(DEFAULT_JOB_WORKFLOW, 'open', 'closed');
} catch (err) {
  invalidRejected = err.code === 'conflict';
}
if (!invalidRejected) {
  console.error('Invalid transition was not rejected.');
  process.exit(1);
}

const rule = repos.workflows.getActiveRule('tenant_demo', 'job');
if (!rule || !rule.definition.transitions.open.includes('scheduled')) {
  console.error('Workflow rule repository failed.');
  process.exit(1);
}

const event = repos.workflows.createEvent('tenant_demo', {
  entityType: 'job',
  entityId: 'job_demo_1',
  fromStatus: 'open',
  toStatus: 'scheduled',
  actorId: 'user_owner',
  notes: 'Test transition'
});

if (!event.id) {
  console.error('Workflow event create failed.');
  process.exit(1);
}

const ownerPermissions = permissionsForRoles(['owner']);
if (!ownerPermissions.includes(PERMISSIONS.WORKFLOWS_WRITE)) {
  console.error('Owner missing workflows.write permission.');
  process.exit(1);
}

const technicianPermissions = permissionsForRoles(['technician']);
if (!technicianPermissions.includes(PERMISSIONS.WORKFLOWS_TRANSITION)) {
  console.error('Technician missing workflows.transition permission.');
  process.exit(1);
}

console.log('Sprint 75 workflow runtime patch test passed.');

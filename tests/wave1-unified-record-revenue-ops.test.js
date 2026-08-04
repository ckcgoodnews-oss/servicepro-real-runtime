/**
 * Wave 1: Unified Record & Revenue Operations Tests
 * Tests: Deals, CRM Contacts, Record Associations, Activity Timeline, Tasks, CRM Properties
 */
const assert = require('assert');
const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');

const TENANT_ID = 'tenant_demo';
const repos = getRepositories();

function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
  } catch (err) {
    console.error(`  \u2717 ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('Wave 1: Unified Record & Revenue Operations');
console.log('============================================');

// --- Deals ---
console.log('\n  Deals Repository');

test('creates a deal', () => {
  const deal = repos.deals.create(TENANT_ID, { name: 'HVAC System Upgrade', amount: 15000, stage: 'qualified', source: 'referral' });
  assert(deal.id, 'should have an id');
  assert.strictEqual(deal.name, 'HVAC System Upgrade');
  assert.strictEqual(deal.amount, 15000);
  assert.strictEqual(deal.status, 'open');
  assert.strictEqual(deal.tenantId, TENANT_ID);
});

test('lists deals by tenant', () => {
  const list = repos.deals.list(TENANT_ID, {});
  assert(list.length >= 1, 'should have at least 1 deal');
  assert(list.every(d => d.tenantId === TENANT_ID), 'all scoped to tenant');
});

test('updates a deal stage', () => {
  const deal = repos.deals.create(TENANT_ID, { name: 'Plumbing Contract', amount: 8000 });
  const updated = repos.deals.update(TENANT_ID, deal.id, { stage: 'proposal', probability: 50 });
  assert.strictEqual(updated.stage, 'proposal');
  assert.strictEqual(updated.probability, 50);
});

test('closes a deal as won', () => {
  const deal = repos.deals.create(TENANT_ID, { name: 'Won Deal', amount: 5000 });
  const updated = repos.deals.update(TENANT_ID, deal.id, { status: 'won', win_reason: 'Best price' });
  assert.strictEqual(updated.status, 'won');
  assert.strictEqual(updated.winReason, 'Best price');
  assert(updated.closedAt, 'should have closedAt');
});

test('generates forecast summary', () => {
  const forecast = repos.deals.forecast(TENANT_ID, {});
  assert(Array.isArray(forecast), 'forecast should be an array');
  assert(forecast.length > 0, 'should have at least one stage group');
});

test('creates and lists pipelines', () => {
  const pipeline = repos.deals.createPipeline(TENANT_ID, { name: 'Sales Pipeline', is_default: true });
  assert(pipeline.id, 'pipeline should have id');
  const pipelines = repos.deals.listPipelines(TENANT_ID);
  assert(pipelines.length >= 1, 'should have at least 1 pipeline');
});

test('manages deal products', () => {
  const deal = repos.deals.create(TENANT_ID, { name: 'Product Deal', amount: 10000 });
  const product = repos.deals.addProduct(TENANT_ID, deal.id, { name: 'AC Unit', quantity: 2, unit_price: 3000, discount_percent: 10 });
  assert.strictEqual(product.name, 'AC Unit');
  assert.strictEqual(product.total, 5400); // 2 * 3000 * 0.9
  const products = repos.deals.listProducts(TENANT_ID, deal.id);
  assert.strictEqual(products.length, 1);
  repos.deals.removeProduct(TENANT_ID, product.id);
  assert.strictEqual(repos.deals.listProducts(TENANT_ID, deal.id).length, 0);
});

test('tenant isolation on deals', () => {
  repos.deals.create('other_tenant', { name: 'Other Tenant Deal', amount: 999 });
  const list = repos.deals.list(TENANT_ID, {});
  assert(!list.some(d => d.tenantId === 'other_tenant'), 'should not see other tenant deals');
});

// --- CRM Contacts ---
console.log('\n  CRM Contacts Repository');

test('creates a contact', () => {
  const contact = repos.crmContacts.create(TENANT_ID, { first_name: 'John', last_name: 'Smith', email: 'john@example.com', source: 'website' });
  assert(contact.id, 'should have an id');
  assert.strictEqual(contact.firstName, 'John');
  assert.strictEqual(contact.lastName, 'Smith');
  assert.strictEqual(contact.lifecycleStage, 'subscriber');
});

test('finds contact by email', () => {
  const contact = repos.crmContacts.findByEmail(TENANT_ID, 'john@example.com');
  assert(contact, 'should find contact');
  assert.strictEqual(contact.firstName, 'John');
});

test('updates contact lifecycle', () => {
  const contact = repos.crmContacts.create(TENANT_ID, { first_name: 'Jane', email: 'jane@example.com' });
  const updated = repos.crmContacts.update(TENANT_ID, contact.id, { lifecycle_stage: 'mql' });
  assert.strictEqual(updated.lifecycleStage, 'mql');
});

test('detects duplicate contacts', () => {
  const dups = repos.crmContacts.findDuplicates(TENANT_ID, 'john@example.com', null);
  assert(dups.length >= 1, 'should detect duplicate by email');
});

test('searches contacts', () => {
  const results = repos.crmContacts.list(TENANT_ID, { search: 'john' });
  assert(results.length >= 1, 'should find by search');
});

test('tenant isolation on contacts', () => {
  repos.crmContacts.create('other_tenant_2', { first_name: 'Isolated', email: 'isolated@test.com' });
  const list = repos.crmContacts.list(TENANT_ID, {});
  assert(!list.some(c => c.tenantId === 'other_tenant_2'), 'should not see other tenant contacts');
});

// --- Record Associations ---
console.log('\n  Record Associations Repository');

test('creates an association between records', () => {
  const assoc = repos.recordAssociations.create(TENANT_ID, {
    source_type: 'deal', source_id: 'deal-001',
    target_type: 'contact', target_id: 'contact-001',
    association_type: 'primary'
  });
  assert(assoc.id, 'should have id');
  assert.strictEqual(assoc.sourceType, 'deal');
  assert.strictEqual(assoc.targetType, 'contact');
});

test('lists associations for an entity', () => {
  const assocs = repos.recordAssociations.listForEntity(TENANT_ID, 'deal', 'deal-001');
  assert(assocs.length >= 1, 'should find associations');
});

test('removes an association by id', () => {
  const assoc = repos.recordAssociations.create(TENANT_ID, {
    source_type: 'job', source_id: 'job-001',
    target_type: 'invoice', target_id: 'invoice-001'
  });
  const result = repos.recordAssociations.removeById(TENANT_ID, assoc.id);
  assert(result.deleted, 'should delete');
  const assocs = repos.recordAssociations.listForEntity(TENANT_ID, 'job', 'job-001');
  assert.strictEqual(assocs.length, 0);
});

// --- Activity Timeline ---
console.log('\n  Activity Timeline Repository');

test('creates an activity', () => {
  const activity = repos.activityTimeline.create(TENANT_ID, {
    entity_type: 'deal', entity_id: 'deal-001',
    activity_type: 'note', title: 'Initial meeting',
    description: 'Discussed requirements', performed_by: 'user-001'
  });
  assert(activity.id, 'should have id');
  assert.strictEqual(activity.activityType, 'note');
});

test('lists activities for an entity', () => {
  repos.activityTimeline.create(TENANT_ID, { entity_type: 'deal', entity_id: 'deal-001', activity_type: 'call', title: 'Follow up call' });
  const activities = repos.activityTimeline.list(TENANT_ID, 'deal', 'deal-001', {});
  assert(activities.length >= 2, 'should have multiple activities');
});

test('gets recent activities tenant-wide', () => {
  const recent = repos.activityTimeline.recent(TENANT_ID, 10);
  assert(recent.length >= 1, 'should have recent activities');
  assert(recent.every(a => a.tenantId === TENANT_ID), 'all scoped to tenant');
});

// --- Tasks ---
console.log('\n  Tasks Repository');

test('creates a task', () => {
  const task = repos.tasks.create(TENANT_ID, { title: 'Send proposal', priority: 'high', due_date: '2026-08-10', task_type: 'todo' });
  assert(task.id, 'should have id');
  assert.strictEqual(task.title, 'Send proposal');
  assert.strictEqual(task.priority, 'high');
  assert.strictEqual(task.status, 'open');
});

test('completes a task', () => {
  const task = repos.tasks.create(TENANT_ID, { title: 'Follow up', task_type: 'call' });
  const updated = repos.tasks.update(TENANT_ID, task.id, { status: 'completed' });
  assert.strictEqual(updated.status, 'completed');
  assert(updated.completedAt, 'should have completedAt');
});

test('finds overdue tasks', () => {
  repos.tasks.create(TENANT_ID, { title: 'Overdue task', due_date: '2020-01-01' });
  const overdue = repos.tasks.overdue(TENANT_ID);
  assert(overdue.length >= 1, 'should have overdue tasks');
});

test('counts tasks by status', () => {
  const counts = repos.tasks.countByStatus(TENANT_ID);
  assert(Array.isArray(counts), 'should be array');
  assert(counts.some(c => c.status === 'open'), 'should have open count');
});

test('links task to entity', () => {
  const task = repos.tasks.create(TENANT_ID, { title: 'Deal follow up', entity_type: 'deal', entity_id: 'deal-001' });
  const linked = repos.tasks.list(TENANT_ID, { entity_type: 'deal', entity_id: 'deal-001' });
  assert(linked.length >= 1, 'should find linked task');
});

// --- CRM Property Definitions ---
console.log('\n  CRM Property Definitions Repository');

test('creates a property definition', () => {
  const prop = repos.crmPropertyDefinitions.create(TENANT_ID, {
    object_type: 'contact', name: 'preferred_service_type',
    label: 'Preferred Service Type', field_type: 'select',
    options: [{ value: 'plumbing', label: 'Plumbing' }, { value: 'hvac', label: 'HVAC' }]
  });
  assert(prop.id, 'should have id');
  assert.strictEqual(prop.fieldType, 'select');
  assert.strictEqual(prop.objectType, 'contact');
});

test('lists properties for object type', () => {
  repos.crmPropertyDefinitions.create(TENANT_ID, { object_type: 'deal', name: 'deal_source', label: 'Deal Source', field_type: 'text' });
  const contactProps = repos.crmPropertyDefinitions.list(TENANT_ID, 'contact');
  assert(contactProps.length >= 1, 'should have contact properties');
  assert(contactProps.every(p => p.objectType === 'contact'), 'all should be contact type');
});

test('updates property definition', () => {
  const prop = repos.crmPropertyDefinitions.create(TENANT_ID, { object_type: 'job', name: 'complexity', label: 'Complexity', field_type: 'select' });
  const updated = repos.crmPropertyDefinitions.update(TENANT_ID, prop.id, { label: 'Job Complexity', required: true });
  assert.strictEqual(updated.label, 'Job Complexity');
  assert.strictEqual(updated.required, true);
});

test('upserts by object_type + name', () => {
  repos.crmPropertyDefinitions.create(TENANT_ID, { object_type: 'contact', name: 'preferred_service_type', label: 'Updated Label', field_type: 'multiselect' });
  const props = repos.crmPropertyDefinitions.list(TENANT_ID, 'contact');
  const matching = props.filter(p => p.name === 'preferred_service_type');
  assert.strictEqual(matching.length, 1, 'should upsert, not duplicate');
  assert.strictEqual(matching[0].label, 'Updated Label');
});

// --- Lead Assignment Rules ---
console.log('\n  Lead Assignment Rules Repository');

test('creates a round-robin rule', () => {
  const rule = repos.leadAssignmentRules.create(TENANT_ID, {
    name: 'Default Assignment', strategy: 'round_robin',
    assignees: ['user-a', 'user-b', 'user-c']
  });
  assert(rule.id, 'should have id');
  assert.strictEqual(rule.strategy, 'round_robin');
  assert.strictEqual(rule.assignees.length, 3);
});

test('advances round-robin', () => {
  const rule = repos.leadAssignmentRules.create(TENANT_ID, {
    name: 'RR Test', strategy: 'round_robin',
    assignees: ['alice', 'bob', 'charlie']
  });
  const first = repos.leadAssignmentRules.advanceRoundRobin(TENANT_ID, rule.id);
  assert.strictEqual(first, 'alice');
  const second = repos.leadAssignmentRules.advanceRoundRobin(TENANT_ID, rule.id);
  assert.strictEqual(second, 'bob');
  const third = repos.leadAssignmentRules.advanceRoundRobin(TENANT_ID, rule.id);
  assert.strictEqual(third, 'charlie');
  const fourth = repos.leadAssignmentRules.advanceRoundRobin(TENANT_ID, rule.id);
  assert.strictEqual(fourth, 'alice'); // wraps around
});

test('lists only active rules', () => {
  repos.leadAssignmentRules.create(TENANT_ID, { name: 'Inactive', is_active: false, assignees: ['x'] });
  const active = repos.leadAssignmentRules.getActive(TENANT_ID);
  assert(active.every(r => r.isActive), 'all should be active');
});

console.log('\n============================================');
console.log('Wave 1 tests complete.');

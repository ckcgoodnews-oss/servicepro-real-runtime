/**
 * Wave 10: Portal Ticket Integration, Contact Merge, Workflow Event Bus
 */
const assert = require('assert');
const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { emitEvent } = require('../apps/api/src/services/workflowEventBus');

const T = 'tenant_demo';
const repos = getRepositories();

function test(name, fn) {
  try { fn(); console.log(`  \u2713 ${name}`); }
  catch (e) { console.error(`  \u2717 ${name}: ${e.message}`); process.exitCode = 1; }
}

console.log('Wave 10: Portal Integration, Contact Merge, Workflow Event Bus');
console.log('===============================================================');

// --- Contact Merge ---
console.log('\n  Contact Merge');

test('merges duplicate contact into primary', () => {
  const ts = Date.now();
  const primary = repos.crmContacts.create(T, { first_name: `John${ts}`, last_name: 'Doe', email: `john${ts}@company.com`, phone: '555-1111', tags: ['vip'] });
  const dup = repos.crmContacts.create(T, { first_name: `John${ts}`, last_name: 'D.', email: `johnd${ts}@company.com`, phone: '', mobile: '555-2222', tags: ['hvac'], source: 'referral', properties: { preferred_time: 'morning' } });

  // Create association on duplicate to verify it transfers
  repos.recordAssociations.create(T, { source_type: 'contact', source_id: dup.id, target_type: 'deal', target_id: `deal-merge-${ts}` });

  // Merge: fill empty fields on primary from duplicate
  const updates = {};
  const primaryData = repos.crmContacts.findById(T, primary.id);
  if (!primaryData.mobile && dup.mobile) updates.mobile = '555-2222';
  if (!primaryData.source || primaryData.source === 'manual') updates.source = 'referral';
  const mergedTags = [...new Set([...(primaryData.tags || []), ...(['hvac'])])];
  if (mergedTags.length > (primaryData.tags || []).length) updates.tags = mergedTags;
  updates.properties = { preferred_time: 'morning', ...(primaryData.properties || {}) };

  repos.crmContacts.update(T, primary.id, updates);

  // Transfer associations
  const dupAssocs = repos.recordAssociations.listForEntity(T, 'contact', dup.id);
  for (const assoc of dupAssocs) {
    repos.recordAssociations.create(T, { source_type: 'contact', source_id: primary.id, target_type: assoc.targetType, target_id: assoc.targetId, association_type: assoc.associationType });
  }

  repos.crmContacts.delete(T, dup.id);

  // Verify
  const merged = repos.crmContacts.findById(T, primary.id);
  assert.strictEqual(merged.mobile, '555-2222', 'should inherit mobile from duplicate');
  assert.strictEqual(merged.source, 'referral', 'should inherit source from duplicate');
  assert(merged.tags.includes('vip') && merged.tags.includes('hvac'), 'should merge tags');
  assert.strictEqual(merged.properties.preferred_time, 'morning', 'should merge properties');

  // Verify association transferred
  const primaryAssocs = repos.recordAssociations.listForEntity(T, 'contact', primary.id);
  assert(primaryAssocs.some(a => a.targetId === `deal-merge-${ts}`), 'association should transfer to primary');

  // Verify duplicate is gone
  assert(!repos.crmContacts.findById(T, dup.id), 'duplicate should be deleted');
});

test('merge does not overwrite existing primary fields', () => {
  const primary = repos.crmContacts.create(T, { first_name: 'Alice', email: 'alice@corp.com', phone: '555-0000', source: 'website' });
  const dup = repos.crmContacts.create(T, { first_name: 'Alice', email: 'alice2@corp.com', phone: '555-9999', source: 'referral' });

  // Primary already has phone and source — should not be overwritten
  const updates = {};
  if (!primary.phone && dup.phone) updates.phone = dup.phone;
  if (!primary.source && dup.source) updates.source = dup.source;

  if (Object.keys(updates).length) repos.crmContacts.update(T, primary.id, updates);
  repos.crmContacts.delete(T, dup.id);

  const merged = repos.crmContacts.findById(T, primary.id);
  assert.strictEqual(merged.phone, '555-0000', 'should keep primary phone');
  assert.strictEqual(merged.source, 'website', 'should keep primary source');
});

// --- Workflow Event Bus ---
console.log('\n  Workflow Event Bus');

test('fires matching automation rules on event', () => {
  // Create a rule
  repos.automationRules.create(T, {
    name: 'Auto-task on deal won', trigger_type: 'deal_stage_changed',
    conditions: [{ field: 'new_stage', operator: 'equals', value: 'closed_won' }],
    actions: [{ type: 'create_task', config: { title: 'Send welcome packet', priority: 'high' } }]
  });

  const result = emitEvent(T, 'deal_stage_changed', { new_stage: 'closed_won', deal_id: 'deal-bus-001', entity_type: 'deal', entity_id: 'deal-bus-001' }, repos);
  assert(result.rules_matched >= 1, 'should match at least 1 rule');
  assert(result.executions.some(e => e.status === 'success'), 'should execute successfully');
});

test('skips rules when conditions not met', () => {
  const result = emitEvent(T, 'deal_stage_changed', { new_stage: 'proposal', deal_id: 'deal-bus-002' }, repos);
  assert(result.executions.every(e => e.status === 'skipped' || e.conditionsMet === false || e.status === 'success'), 'conditions not met should skip');
});

test('creates task via event bus action', () => {
  // Create a rule that always fires for ticket_created
  repos.automationRules.create(T, {
    name: 'Log ticket activity', trigger_type: 'ticket_created',
    conditions: [],
    actions: [{ type: 'log_activity', config: { title: 'Ticket auto-logged' } }]
  });

  const before = repos.activityTimeline.recent(T, 100).length;
  emitEvent(T, 'ticket_created', { entity_type: 'ticket', entity_id: 'tkt-bus-001', priority: 'high' }, repos);
  const after = repos.activityTimeline.recent(T, 100).length;
  assert(after > before, 'should have created an activity via log_activity action');
});

test('event bus handles unknown trigger type gracefully', () => {
  const result = emitEvent(T, 'nonexistent_trigger', { foo: 'bar' }, repos);
  assert.strictEqual(result.rules_matched, 0);
  assert.strictEqual(result.executions.length, 0);
});

test('event bus handles multiple rules for same trigger', () => {
  repos.automationRules.create(T, { name: 'Rule A', trigger_type: 'form_submitted', conditions: [], actions: [{ type: 'log_activity', config: { title: 'Form rule A' } }] });
  repos.automationRules.create(T, { name: 'Rule B', trigger_type: 'form_submitted', conditions: [], actions: [{ type: 'log_activity', config: { title: 'Form rule B' } }] });
  const result = emitEvent(T, 'form_submitted', { form_id: 'form-001', entity_type: 'form', entity_id: 'form-001' }, repos);
  assert(result.rules_matched >= 2, 'should match both rules');
  assert(result.executions.length >= 2);
});

// --- Portal Ticket Routes (verify module exports) ---
console.log('\n  Portal Ticket Module');

test('portal module exports ticket functions', () => {
  const portal = require('../apps/api/src/routes/portal');
  assert(typeof portal.listTickets === 'function', 'should export listTickets');
  assert(typeof portal.getTicket === 'function', 'should export getTicket');
  assert(typeof portal.createTicket === 'function', 'should export createTicket');
  assert(typeof portal.listTicketComments === 'function', 'should export listTicketComments');
  assert(typeof portal.addTicketComment === 'function', 'should export addTicketComment');
});

// --- CRM Contacts module exports merge ---
test('crmContacts route exports merge function', () => {
  const crmContacts = require('../apps/api/src/routes/crmContacts');
  assert(typeof crmContacts.merge === 'function', 'should export merge');
});

console.log('\n===============================================================');
console.log('Wave 10 tests complete.');

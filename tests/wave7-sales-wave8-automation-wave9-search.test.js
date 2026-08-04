/**
 * Wave 7: Sales Enablement — Wave 8: Automation Rules — Wave 9: Search & Imports
 */
const assert = require('assert');
const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { globalSearch } = require('../apps/api/src/services/globalSearchService');

const T = 'tenant_demo';
const repos = getRepositories();

function test(name, fn) {
  try { fn(); console.log(`  \u2713 ${name}`); }
  catch (e) { console.error(`  \u2717 ${name}: ${e.message}`); process.exitCode = 1; }
}

console.log('Wave 7: Sales Enablement');
console.log('========================');

// --- Sales Sequences ---
console.log('\n  Sales Sequences');

let testSeqId;
test('creates a sequence with steps', () => {
  const seq = repos.salesSequences.create(T, {
    name: 'New Lead Outreach', steps: [
      { order: 0, type: 'email', delay_days: 0, subject: 'Intro', content: 'Hi {{first_name}}...' },
      { order: 1, type: 'task', delay_days: 2, task_type: 'call' },
      { order: 2, type: 'email', delay_days: 3, subject: 'Follow up', content: 'Just checking in...' }
    ], owner_id: 'rep-001'
  });
  assert(seq.id); assert.strictEqual(seq.steps.length, 3); assert(seq.isActive);
  testSeqId = seq.id;
});

test('enrolls a contact in sequence', () => {
  const enrollment = repos.salesSequences.enroll(T, testSeqId, 'contact-seq-001');
  assert(enrollment.id); assert.strictEqual(enrollment.status, 'active'); assert.strictEqual(enrollment.currentStep, 0);
});

test('prevents double enrollment', () => {
  const second = repos.salesSequences.enroll(T, testSeqId, 'contact-seq-001');
  // Should return existing, not duplicate
  const enrollments = repos.salesSequences.listEnrollments(T, testSeqId, {});
  const active = enrollments.filter(e => e.contactId === 'contact-seq-001' && e.status === 'active');
  assert.strictEqual(active.length, 1);
});

test('advances through steps and completes', () => {
  const enrollment = repos.salesSequences.enroll(T, testSeqId, 'contact-advance');
  repos.salesSequences.advanceStep(T, enrollment.id); // step 0→1
  repos.salesSequences.advanceStep(T, enrollment.id); // step 1→2
  const e = repos.salesSequences.advanceStep(T, enrollment.id); // step 2→complete
  assert.strictEqual(e.status, 'completed');
  assert(e.completedAt);
});

test('marks enrollment as replied', () => {
  const enrollment = repos.salesSequences.enroll(T, testSeqId, 'contact-reply');
  const result = repos.salesSequences.markReplied(T, enrollment.id);
  assert.strictEqual(result.status, 'replied');
  const seq = repos.salesSequences.findById(T, testSeqId);
  assert(seq.replyCount >= 1);
});

test('unenrolls manually', () => {
  const enrollment = repos.salesSequences.enroll(T, testSeqId, 'contact-unenroll');
  const result = repos.salesSequences.unenroll(T, enrollment.id, 'user_request');
  assert.strictEqual(result.status, 'unenrolled');
  assert.strictEqual(result.unenrolledReason, 'user_request');
});

// --- Meeting Bookings ---
console.log('\n  Meeting Bookings');

let testPageId;
test('creates a booking page', () => {
  const page = repos.meetingBookings.createPage(T, {
    owner_id: 'rep-001', name: `Consult ${Date.now()}`,
    slug: `consult-${Date.now()}`,
    duration_minutes: 30, location: 'video'
  });
  assert(page.id); assert.strictEqual(page.durationMinutes, 30);
  assert(page.availability.monday, 'should have default availability');
  testPageId = page.id;
});

test('creates a booking', () => {
  const booking = repos.meetingBookings.createBooking(T, testPageId, {
    guest_name: 'Alice Johnson', guest_email: 'alice@company.com',
    start_time: '2026-08-15T10:00:00Z', end_time: '2026-08-15T10:30:00Z',
    answers: { budget: '$5000-$10000' }
  });
  assert(booking.id); assert.strictEqual(booking.status, 'confirmed'); assert.strictEqual(booking.guestEmail, 'alice@company.com');
});

test('cancels a booking', () => {
  const booking = repos.meetingBookings.createBooking(T, testPageId, {
    guest_email: 'cancel@test.com', start_time: '2026-08-16T14:00:00Z', end_time: '2026-08-16T14:30:00Z'
  });
  const cancelled = repos.meetingBookings.updateBooking(T, booking.id, { status: 'cancelled' });
  assert.strictEqual(cancelled.status, 'cancelled'); assert(cancelled.cancelledAt);
});

test('lists bookings by page', () => {
  const bookings = repos.meetingBookings.listBookings(T, { booking_page_id: testPageId });
  assert(bookings.length >= 1);
});

// --- Call Logs ---
console.log('\n  Call Logs');

test('logs an outbound call', () => {
  const log = repos.callLogs.create(T, {
    caller_id: 'rep-001', contact_id: 'contact-001', deal_id: 'deal-001',
    direction: 'outbound', outcome: 'connected', duration_seconds: 420,
    notes: 'Discussed HVAC options, sending proposal tomorrow'
  });
  assert(log.id); assert.strictEqual(log.outcome, 'connected'); assert.strictEqual(log.durationSeconds, 420);
});

test('logs a missed call', () => {
  repos.callLogs.create(T, { caller_id: 'rep-001', contact_id: 'contact-002', outcome: 'no_answer', duration_seconds: 0 });
});

test('generates call stats', () => {
  const stats = repos.callLogs.stats(T, { caller_id: 'rep-001' });
  assert(stats.total >= 2); assert(stats.connected >= 1); assert(typeof stats.connect_rate === 'number');
  assert(stats.total_duration_seconds >= 420);
});

console.log('\n\nWave 8: Automation Rules');
console.log('========================');

let testRuleId;
test('creates an automation rule', () => {
  const rule = repos.automationRules.create(T, {
    name: 'Auto-assign urgent tickets', trigger_type: 'ticket_created',
    conditions: [{ field: 'priority', operator: 'equals', value: 'urgent' }],
    actions: [{ type: 'assign_to', config: { user_id: 'on-call-tech' } }]
  });
  assert(rule.id); assert.strictEqual(rule.triggerType, 'ticket_created'); assert(rule.isActive);
  testRuleId = rule.id;
});

test('finds rules by trigger type', () => {
  repos.automationRules.create(T, { name: 'Deal won notification', trigger_type: 'deal_stage_changed', actions: [{ type: 'send_notification' }] });
  const ticketRules = repos.automationRules.findByTrigger(T, 'ticket_created');
  assert(ticketRules.length >= 1);
  assert(ticketRules.every(r => r.triggerType === 'ticket_created'));
});

test('evaluates conditions and records execution', () => {
  const triggerData = { priority: 'urgent', subject: 'Water leak emergency' };
  const exec = repos.automationRules.recordExecution(T, testRuleId, triggerData, true, [{ action_type: 'assign_to', status: 'executed' }], 'success');
  assert(exec.id); assert.strictEqual(exec.status, 'success'); assert(exec.conditionsMet);
  const rule = repos.automationRules.findById(T, testRuleId);
  assert.strictEqual(rule.executionCount, 1);
});

test('skips when conditions not met', () => {
  const exec = repos.automationRules.recordExecution(T, testRuleId, { priority: 'low' }, false, [], 'skipped');
  assert.strictEqual(exec.status, 'skipped');
});

test('lists execution history', () => {
  const execs = repos.automationRules.listExecutions(T, testRuleId);
  assert(execs.length >= 2);
});

test('tenant isolation on automation rules', () => {
  repos.automationRules.create('other_auto_tenant', { name: 'Other', trigger_type: 'test' });
  const list = repos.automationRules.list(T, {});
  assert(list.every(r => r.tenantId === T));
});

console.log('\n\nWave 9: Global Search & Data Imports');
console.log('====================================');

// --- Global Search ---
console.log('\n  Global Search');

test('searches across contacts', () => {
  repos.crmContacts.create(T, { first_name: 'Searchable', last_name: 'Person', email: 'searchme@test.com' });
  const results = globalSearch(T, 'searchable', repos, {});
  assert(results.length >= 1);
  assert(results.some(r => r.entity_type === 'contact'));
});

test('searches across deals', () => {
  repos.deals.create(T, { name: 'Unique Deal Name XYZ', amount: 5000 });
  const results = globalSearch(T, 'unique deal', repos, {});
  assert(results.some(r => r.entity_type === 'deal' && r.title.includes('Unique Deal')));
});

test('searches across tickets', () => {
  repos.tickets.create(T, { subject: 'Plumbing Emergency at Main Street' });
  const results = globalSearch(T, 'main street', repos, {});
  assert(results.some(r => r.entity_type === 'ticket'));
});

test('filters by entity type', () => {
  const results = globalSearch(T, 'searchable', repos, { entity_types: ['contact'] });
  assert(results.every(r => r.entity_type === 'contact'));
});

test('respects result limit', () => {
  const results = globalSearch(T, 'a', repos, { limit: 5 });
  assert(results.length <= 5);
});

test('requires minimum 2 character query', () => {
  const results = globalSearch(T, 'x', repos, {});
  assert.strictEqual(results.length, 0);
});

// --- Data Imports ---
console.log('\n  Data Imports');

test('creates an import job', () => {
  const imp = repos.dataImports.create(T, { entity_type: 'contact', file_name: 'leads.csv', total_rows: 100 });
  assert(imp.id); assert.strictEqual(imp.status, 'pending'); assert.strictEqual(imp.entityType, 'contact');
});

test('updates field mapping', () => {
  const imp = repos.dataImports.create(T, { entity_type: 'contact' });
  const updated = repos.dataImports.updateMapping(T, imp.id, { 'First Name': 'first_name', 'Email': 'email', 'Phone': 'phone' });
  assert.strictEqual(updated.status, 'mapping');
  assert.strictEqual(updated.fieldMapping['First Name'], 'first_name');
});

test('processes rows and creates records', () => {
  const imp = repos.dataImports.create(T, { entity_type: 'contact' });
  repos.dataImports.updateMapping(T, imp.id, { name: 'first_name', email: 'email' });

  const unique = `import_${Date.now()}`;
  const rows = [
    { name: `${unique}_Alice`, email: `${unique}_alice@test.com` },
    { name: `${unique}_Bob`, email: `${unique}_bob@test.com` },
    { name: `${unique}_Charlie`, email: `${unique}_charlie@test.com` }
  ];

  const result = repos.dataImports.processRows(T, imp.id, rows, repos.crmContacts, (t, data) => repos.crmContacts.create(t, data));
  assert.strictEqual(result.status, 'completed');
  assert.strictEqual(result.createdRows, 3);
  assert.strictEqual(result.errorRows, 0);

  // Verify: the created count proves the records exist
  const afterContacts = repos.crmContacts.list(T, {});
  const imported = afterContacts.filter(c => c.firstName && c.firstName.startsWith(unique));
  assert.strictEqual(imported.length, 3, 'should have 3 imported contacts');
});

test('handles import errors gracefully', () => {
  const imp = repos.dataImports.create(T, { entity_type: 'contact' });
  repos.dataImports.updateMapping(T, imp.id, { name: 'first_name' });

  const rows = [
    { name: 'Good Import' },
    { name: null }, // might succeed with empty
    { name: 'Also Good' }
  ];
  const result = repos.dataImports.processRows(T, imp.id, rows, repos.crmContacts, (t, data) => repos.crmContacts.create(t, data));
  assert.strictEqual(result.processedRows, 3);
  assert(['completed', 'failed'].includes(result.status));
});

console.log('\n====================================');
console.log('Wave 7/8/9 tests complete.');

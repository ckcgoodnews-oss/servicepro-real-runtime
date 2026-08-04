/**
 * Wave 4: Marketing Segmentation, Lead Capture Forms & Campaign Attribution
 */
const assert = require('assert');
const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');

const T = 'tenant_demo';
const repos = getRepositories();

function test(name, fn) {
  try { fn(); console.log(`  \u2713 ${name}`); }
  catch (e) { console.error(`  \u2717 ${name}: ${e.message}`); process.exitCode = 1; }
}

console.log('Wave 4: Marketing Segmentation, Forms & Attribution');
console.log('====================================================');

// --- Audience Segments ---
console.log('\n  Audience Segments');

test('creates a dynamic segment', () => {
  const seg = repos.audienceSegments.create(T, {
    name: 'Active HVAC Customers', segment_type: 'dynamic',
    criteria: { rules: [{ field: 'lifecycle_stage', operator: 'equals', value: 'customer' }], logic: 'AND' }
  });
  assert(seg.id);
  assert.strictEqual(seg.segmentType, 'dynamic');
  assert(seg.criteria.rules.length === 1);
});

test('creates a static segment', () => {
  const seg = repos.audienceSegments.create(T, {
    name: 'VIP Contacts', segment_type: 'static', contact_ids: ['c1', 'c2', 'c3']
  });
  assert.strictEqual(seg.memberCount, 3);
});

test('adds and removes static segment members', () => {
  const seg = repos.audienceSegments.create(T, { name: 'Test Static', segment_type: 'static' });
  repos.audienceSegments.addMember(T, seg.id, 'contact-x');
  repos.audienceSegments.addMember(T, seg.id, 'contact-y');
  const updated = repos.audienceSegments.findById(T, seg.id);
  assert.strictEqual(updated.memberCount, 2);
  repos.audienceSegments.removeMember(T, seg.id, 'contact-x');
  const after = repos.audienceSegments.findById(T, seg.id);
  assert.strictEqual(after.memberCount, 1);
});

test('evaluates dynamic segment against contacts', () => {
  repos.crmContacts.create(T, { first_name: 'Alan', email: 'alan@test.com', lifecycle_stage: 'customer' });
  repos.crmContacts.create(T, { first_name: 'Beth', email: 'beth@test.com', lifecycle_stage: 'lead' });
  const seg = repos.audienceSegments.create(T, {
    name: 'Customers Only', segment_type: 'dynamic',
    criteria: { rules: [{ field: 'lifecycle_stage', operator: 'equals', value: 'customer' }] }
  });
  const contacts = repos.crmContacts.list(T, {});
  const result = repos.audienceSegments.evaluate(T, seg.id, contacts);
  assert(result.memberCount >= 1, 'should match customer lifecycle contacts');
  assert(result.lastEvaluatedAt, 'should set evaluation timestamp');
});

test('tenant isolation on segments', () => {
  repos.audienceSegments.create('other_seg_tenant', { name: 'Other Seg' });
  const list = repos.audienceSegments.list(T, {});
  assert(list.every(s => s.tenantId === T));
});

// --- Lead Capture Forms ---
console.log('\n  Lead Capture Forms');

let testFormId;
test('creates a form with default fields', () => {
  const form = repos.leadCaptureForms.create(T, {
    name: 'Get a Free Quote', description: 'Quote request form'
  });
  assert(form.id);
  assert(form.slug === 'get-a-free-quote', 'should auto-generate slug');
  assert(form.fields.length >= 4, 'should have default fields');
  assert(form.fields.some(f => f.name === 'email' && f.required));
  testFormId = form.id;
});

test('creates a form with custom fields', () => {
  const form = repos.leadCaptureForms.create(T, {
    name: 'HVAC Service Request',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'service_type', label: 'Service Type', type: 'select', required: true, options: ['HVAC', 'Plumbing', 'Electrical'] },
      { name: 'preferred_date', label: 'Preferred Date', type: 'date', required: false }
    ]
  });
  assert.strictEqual(form.fields.length, 4);
  assert.strictEqual(form.fields[2].type, 'select');
});

test('prevents duplicate slugs', () => {
  try {
    repos.leadCaptureForms.create(T, { name: 'Get a Free Quote', slug: 'get-a-free-quote' });
    assert.fail('should throw on duplicate slug');
  } catch (e) {
    assert.strictEqual(e.code, 'slug_conflict');
  }
});

test('updates form settings', () => {
  const updated = repos.leadCaptureForms.update(T, testFormId, {
    settings: { submit_message: 'We will call you within 24 hours!', redirect_url: '/thank-you' }
  });
  assert.strictEqual(updated.settings.submit_message, 'We will call you within 24 hours!');
  assert.strictEqual(updated.settings.redirect_url, '/thank-you');
});

test('records form submissions', () => {
  const sub = repos.leadCaptureForms.recordSubmission(T, testFormId, {
    data: { first_name: 'Tom', email: 'tom@example.com', phone: '555-1234' },
    utm_source: 'google', utm_medium: 'cpc'
  });
  assert(sub.id);
  assert.strictEqual(sub.utmSource, 'google');
  const form = repos.leadCaptureForms.findById(T, testFormId);
  assert.strictEqual(form.submissionCount, 1);
});

test('lists form submissions', () => {
  const subs = repos.leadCaptureForms.listSubmissions(T, testFormId, {});
  assert(subs.length >= 1);
});

test('finds form by slug', () => {
  const form = repos.leadCaptureForms.findBySlug(T, 'get-a-free-quote');
  assert(form, 'should find by slug');
  assert.strictEqual(form.id, testFormId);
});

test('tenant isolation on forms', () => {
  repos.leadCaptureForms.create('other_form_tenant', { name: 'Other Form' });
  const list = repos.leadCaptureForms.list(T, {});
  assert(list.every(f => f.tenantId === T));
});

// --- Campaign Attribution ---
console.log('\n  Campaign Attribution');

test('records attribution touch points', () => {
  const attr = repos.campaignAttributions.record(T, {
    campaign_id: 'camp-001', campaign_name: 'Spring HVAC Promo',
    entity_type: 'contact', entity_id: 'contact-001',
    touch_type: 'form_submit', channel: 'form',
    utm_source: 'email', utm_medium: 'newsletter'
  });
  assert(attr.id);
  assert.strictEqual(attr.touchType, 'form_submit');
  assert.strictEqual(attr.channel, 'form');
});

test('records multiple touches per entity', () => {
  repos.campaignAttributions.record(T, {
    campaign_id: 'camp-001', entity_type: 'contact', entity_id: 'contact-001',
    touch_type: 'email_open', channel: 'email'
  });
  repos.campaignAttributions.record(T, {
    campaign_id: 'camp-001', entity_type: 'contact', entity_id: 'contact-001',
    touch_type: 'email_click', channel: 'email'
  });
  const touches = repos.campaignAttributions.listForEntity(T, 'contact', 'contact-001');
  assert(touches.length >= 2);
});

test('summarizes attribution by campaign', () => {
  repos.campaignAttributions.record(T, {
    campaign_id: 'camp-002', campaign_name: 'Summer Special',
    entity_type: 'deal', entity_id: 'deal-001',
    touch_type: 'email_click', channel: 'email', revenue_attributed: 5000
  });
  const summary = repos.campaignAttributions.summary(T, {});
  assert(summary.length >= 1);
  const camp1 = summary.find(s => s.campaignId === 'camp-001');
  assert(camp1.touchCount >= 3);
  assert(camp1.uniqueEntities >= 1);
});

test('tracks campaign send statistics', () => {
  const send = repos.campaignAttributions.recordSend(T, {
    campaign_id: 'camp-email-001', email: 'user@example.com', contact_id: 'c-001'
  });
  assert(send.id);
  assert.strictEqual(send.status, 'queued');
  repos.campaignAttributions.updateSendStatus(T, send.id, 'sent');
  repos.campaignAttributions.updateSendStatus(T, send.id, 'opened');
  const stats = repos.campaignAttributions.sendStats(T, 'camp-email-001');
  assert.strictEqual(stats.total, 1);
  assert.strictEqual(stats.opened, 1);
  assert.strictEqual(stats.open_rate, 100);
});

console.log('\n====================================================');
console.log('Wave 4 tests complete.');

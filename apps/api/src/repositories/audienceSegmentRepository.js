const { makeId, now } = require('../services/id');

function createAudienceSegmentRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId, filters = {}) {
      const d = data();
      d.audienceSegments ||= [];
      let results = d.audienceSegments.filter(s => s.tenantId === tenantId);
      if (filters.segment_type) results = results.filter(s => s.segmentType === filters.segment_type);
      return results.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },

    findById(tenantId, id) {
      const d = data();
      d.audienceSegments ||= [];
      return d.audienceSegments.find(s => s.tenantId === tenantId && s.id === id) || null;
    },

    create(tenantId, input) {
      const d = data();
      d.audienceSegments ||= [];
      const segment = {
        id: makeId('seg'),
        tenantId,
        name: input.name || '',
        description: input.description || '',
        segmentType: input.segment_type || 'dynamic',
        criteria: input.criteria || {},
        contactIds: input.contact_ids || [],
        memberCount: (input.contact_ids || []).length,
        tags: input.tags || [],
        lastEvaluatedAt: null,
        createdAt: now(),
        updatedAt: now()
      };
      d.audienceSegments.push(segment);
      save(d);
      return segment;
    },

    update(tenantId, id, input) {
      const d = data();
      d.audienceSegments ||= [];
      const idx = d.audienceSegments.findIndex(s => s.tenantId === tenantId && s.id === id);
      if (idx === -1) return null;
      const seg = d.audienceSegments[idx];
      if (input.name !== undefined) seg.name = input.name;
      if (input.description !== undefined) seg.description = input.description;
      if (input.criteria !== undefined) seg.criteria = input.criteria;
      if (input.contact_ids !== undefined) {
        seg.contactIds = input.contact_ids;
        seg.memberCount = input.contact_ids.length;
      }
      if (input.tags !== undefined) seg.tags = input.tags;
      seg.updatedAt = now();
      save(d);
      return seg;
    },

    delete(tenantId, id) {
      const d = data();
      d.audienceSegments ||= [];
      const idx = d.audienceSegments.findIndex(s => s.tenantId === tenantId && s.id === id);
      if (idx === -1) return null;
      d.audienceSegments.splice(idx, 1);
      save(d);
      return { deleted: true };
    },

    // Evaluate dynamic segment against contacts
    evaluate(tenantId, id, contacts = []) {
      const d = data();
      d.audienceSegments ||= [];
      const seg = d.audienceSegments.find(s => s.tenantId === tenantId && s.id === id);
      if (!seg || seg.segmentType !== 'dynamic') return seg;

      const matched = contacts.filter(c => matchesCriteria(c, seg.criteria));
      seg.contactIds = matched.map(c => c.id);
      seg.memberCount = matched.length;
      seg.lastEvaluatedAt = now();
      save(d);
      return seg;
    },

    addMember(tenantId, id, contactId) {
      const d = data();
      d.audienceSegments ||= [];
      const seg = d.audienceSegments.find(s => s.tenantId === tenantId && s.id === id);
      if (!seg || seg.segmentType !== 'static') return null;
      if (!seg.contactIds.includes(contactId)) {
        seg.contactIds.push(contactId);
        seg.memberCount = seg.contactIds.length;
        save(d);
      }
      return seg;
    },

    removeMember(tenantId, id, contactId) {
      const d = data();
      d.audienceSegments ||= [];
      const seg = d.audienceSegments.find(s => s.tenantId === tenantId && s.id === id);
      if (!seg) return null;
      seg.contactIds = seg.contactIds.filter(cid => cid !== contactId);
      seg.memberCount = seg.contactIds.length;
      save(d);
      return seg;
    }
  };
}

// Simple criteria matching for dynamic segments
function matchesCriteria(contact, criteria) {
  if (!criteria || !criteria.rules || !criteria.rules.length) return true;
  const { rules, logic = 'AND' } = criteria;
  const results = rules.map(rule => evaluateRule(contact, rule));
  return logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
}

function evaluateRule(contact, rule) {
  const { field, operator, value } = rule;
  const fieldMap = {
    lifecycle_stage: 'lifecycleStage', lead_status: 'leadStatus',
    source: 'source', owner_id: 'ownerId', company_id: 'companyId'
  };
  const contactValue = contact[fieldMap[field] || field];
  switch (operator) {
    case 'equals': return contactValue === value;
    case 'not_equals': return contactValue !== value;
    case 'contains': return String(contactValue || '').toLowerCase().includes(String(value).toLowerCase());
    case 'in': return Array.isArray(value) && value.includes(contactValue);
    case 'not_in': return Array.isArray(value) && !value.includes(contactValue);
    case 'is_empty': return !contactValue;
    case 'is_not_empty': return !!contactValue;
    default: return true;
  }
}

function createPostgresImpl(store) { return createJsonImpl(store); }
module.exports = { createAudienceSegmentRepository };

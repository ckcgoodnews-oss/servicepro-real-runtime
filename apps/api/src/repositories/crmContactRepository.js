const { makeId, now } = require('../services/id');

function createCrmContactRepository(store) {
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
      d.crmContacts ||= [];
      let results = d.crmContacts.filter(c => c.tenantId === tenantId);
      if (filters.company_id) results = results.filter(c => c.companyId === filters.company_id);
      if (filters.lifecycle_stage) results = results.filter(c => c.lifecycleStage === filters.lifecycle_stage);
      if (filters.owner_id) results = results.filter(c => c.ownerId === filters.owner_id);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        results = results.filter(c =>
          (c.firstName || '').toLowerCase().includes(s) ||
          (c.lastName || '').toLowerCase().includes(s) ||
          (c.email || '').toLowerCase().includes(s)
        );
      }
      return results.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },

    findById(tenantId, id) {
      const d = data();
      d.crmContacts ||= [];
      return d.crmContacts.find(c => c.tenantId === tenantId && c.id === id) || null;
    },

    findByEmail(tenantId, email) {
      const d = data();
      d.crmContacts ||= [];
      return d.crmContacts.find(c => c.tenantId === tenantId && c.email === email) || null;
    },

    create(tenantId, input) {
      const d = data();
      d.crmContacts ||= [];
      const contact = {
        id: makeId('contact'),
        tenantId,
        firstName: input.first_name || '',
        lastName: input.last_name || '',
        email: input.email || '',
        phone: input.phone || '',
        mobile: input.mobile || '',
        jobTitle: input.job_title || '',
        companyId: input.company_id || null,
        lifecycleStage: input.lifecycle_stage || 'subscriber',
        leadStatus: input.lead_status || null,
        ownerId: input.owner_id || null,
        source: input.source || 'manual',
        properties: input.properties || {},
        tags: input.tags || [],
        lastActivityAt: null,
        createdAt: now(),
        updatedAt: now()
      };
      d.crmContacts.push(contact);
      save(d);
      return contact;
    },

    update(tenantId, id, input) {
      const d = data();
      d.crmContacts ||= [];
      const idx = d.crmContacts.findIndex(c => c.tenantId === tenantId && c.id === id);
      if (idx === -1) return null;
      const contact = d.crmContacts[idx];
      if (input.first_name !== undefined) contact.firstName = input.first_name;
      if (input.last_name !== undefined) contact.lastName = input.last_name;
      if (input.email !== undefined) contact.email = input.email;
      if (input.phone !== undefined) contact.phone = input.phone;
      if (input.mobile !== undefined) contact.mobile = input.mobile;
      if (input.job_title !== undefined) contact.jobTitle = input.job_title;
      if (input.company_id !== undefined) contact.companyId = input.company_id;
      if (input.lifecycle_stage !== undefined) contact.lifecycleStage = input.lifecycle_stage;
      if (input.lead_status !== undefined) contact.leadStatus = input.lead_status;
      if (input.owner_id !== undefined) contact.ownerId = input.owner_id;
      if (input.source !== undefined) contact.source = input.source;
      if (input.properties !== undefined) contact.properties = input.properties;
      if (input.tags !== undefined) contact.tags = input.tags;
      contact.updatedAt = now();
      save(d);
      return contact;
    },

    delete(tenantId, id) {
      const d = data();
      d.crmContacts ||= [];
      const idx = d.crmContacts.findIndex(c => c.tenantId === tenantId && c.id === id);
      if (idx === -1) return null;
      d.crmContacts.splice(idx, 1);
      save(d);
      return { deleted: true };
    },

    findDuplicates(tenantId, email, phone) {
      const d = data();
      d.crmContacts ||= [];
      if (!email && !phone) return [];
      return d.crmContacts.filter(c =>
        c.tenantId === tenantId && (
          (email && c.email === email) ||
          (phone && c.phone === phone)
        )
      );
    },

    count(tenantId, filters = {}) {
      const d = data();
      d.crmContacts ||= [];
      let results = d.crmContacts.filter(c => c.tenantId === tenantId);
      if (filters.lifecycle_stage) results = results.filter(c => c.lifecycleStage === filters.lifecycle_stage);
      return { total: results.length };
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store);
}

module.exports = { createCrmContactRepository };

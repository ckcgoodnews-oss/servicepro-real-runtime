const { makeId, now } = require('../services/id');

function createLeadCaptureFormRepository(store) {
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
      d.leadCaptureForms ||= [];
      let results = d.leadCaptureForms.filter(f => f.tenantId === tenantId);
      if (filters.is_active !== undefined) results = results.filter(f => f.isActive === filters.is_active);
      return results.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },

    findById(tenantId, id) {
      const d = data();
      d.leadCaptureForms ||= [];
      return d.leadCaptureForms.find(f => f.tenantId === tenantId && f.id === id) || null;
    },

    findBySlug(tenantId, slug) {
      const d = data();
      d.leadCaptureForms ||= [];
      return d.leadCaptureForms.find(f => f.tenantId === tenantId && f.slug === slug) || null;
    },

    create(tenantId, input) {
      const d = data();
      d.leadCaptureForms ||= [];
      const slug = input.slug || slugify(input.name || makeId('form'));
      // Ensure slug unique
      const existing = d.leadCaptureForms.find(f => f.tenantId === tenantId && f.slug === slug);
      if (existing) throw Object.assign(new Error('Form slug already exists'), { code: 'slug_conflict', status: 409 });

      const form = {
        id: makeId('form'),
        tenantId,
        name: input.name || '',
        slug,
        description: input.description || '',
        fields: input.fields || [
          { name: 'first_name', label: 'First Name', type: 'text', required: true },
          { name: 'last_name', label: 'Last Name', type: 'text', required: false },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Phone', type: 'phone', required: false },
          { name: 'message', label: 'Message', type: 'textarea', required: false }
        ],
        settings: input.settings || {
          submit_message: 'Thank you! We will be in touch shortly.',
          redirect_url: null,
          notify_emails: [],
          spam_protection: true
        },
        style: input.style || { button_text: 'Submit', button_color: '#0073ea' },
        campaignId: input.campaign_id || null,
        segmentId: input.segment_id || null,
        isActive: input.is_active !== false,
        submissionCount: 0,
        createdAt: now(),
        updatedAt: now()
      };
      d.leadCaptureForms.push(form);
      save(d);
      return form;
    },

    update(tenantId, id, input) {
      const d = data();
      d.leadCaptureForms ||= [];
      const idx = d.leadCaptureForms.findIndex(f => f.tenantId === tenantId && f.id === id);
      if (idx === -1) return null;
      const form = d.leadCaptureForms[idx];
      if (input.name !== undefined) form.name = input.name;
      if (input.description !== undefined) form.description = input.description;
      if (input.fields !== undefined) form.fields = input.fields;
      if (input.settings !== undefined) form.settings = { ...form.settings, ...input.settings };
      if (input.style !== undefined) form.style = { ...form.style, ...input.style };
      if (input.campaign_id !== undefined) form.campaignId = input.campaign_id;
      if (input.segment_id !== undefined) form.segmentId = input.segment_id;
      if (input.is_active !== undefined) form.isActive = !!input.is_active;
      form.updatedAt = now();
      save(d);
      return form;
    },

    delete(tenantId, id) {
      const d = data();
      d.leadCaptureForms ||= [];
      const idx = d.leadCaptureForms.findIndex(f => f.tenantId === tenantId && f.id === id);
      if (idx === -1) return null;
      d.leadCaptureForms.splice(idx, 1);
      save(d);
      return { deleted: true };
    },

    // Form submissions
    listSubmissions(tenantId, formId, filters = {}) {
      const d = data();
      d.formSubmissions ||= [];
      let results = d.formSubmissions.filter(s => s.tenantId === tenantId && s.formId === formId);
      if (filters.contact_id) results = results.filter(s => s.contactId === filters.contact_id);
      return results.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
    },

    recordSubmission(tenantId, formId, submissionData) {
      const d = data();
      d.formSubmissions ||= [];
      d.leadCaptureForms ||= [];

      const submission = {
        id: makeId('sub'),
        tenantId,
        formId,
        data: submissionData.data || {},
        contactId: submissionData.contact_id || null,
        leadId: submissionData.lead_id || null,
        sourceUrl: submissionData.source_url || null,
        ipAddress: submissionData.ip_address || null,
        utmSource: submissionData.utm_source || null,
        utmMedium: submissionData.utm_medium || null,
        utmCampaign: submissionData.utm_campaign || null,
        utmContent: submissionData.utm_content || null,
        utmTerm: submissionData.utm_term || null,
        submittedAt: now()
      };
      d.formSubmissions.push(submission);

      // Increment submission count
      const formIdx = d.leadCaptureForms.findIndex(f => f.tenantId === tenantId && f.id === formId);
      if (formIdx >= 0) d.leadCaptureForms[formIdx].submissionCount++;

      save(d);
      return submission;
    }
  };
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function createPostgresImpl(store) { return createJsonImpl(store); }
module.exports = { createLeadCaptureFormRepository };

const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.leadCaptureForms; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const isActive = url.searchParams.get('is_active');
  const filters = isActive !== null ? { is_active: isActive !== 'false' } : {};
  Promise.resolve(repo(req).list(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Form not found' } }));
}

function create(req, res) {
  const { name } = req.body || {};
  if (!name) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name is required' } });
  try {
    const data = repo(req).create(tenant(req), req.body);
    sendJson(res, 201, { data });
  } catch (err) {
    sendJson(res, err.status || 400, { error: { code: err.code || 'create_failed', message: err.message } });
  }
}

function update(req, res, id) {
  Promise.resolve(repo(req).update(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Form not found' } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Form not found' } }));
}

function listSubmissions(req, res, formId) {
  Promise.resolve(repo(req).listSubmissions(tenant(req), formId, {}))
    .then(data => sendJson(res, 200, { data }));
}

// Public form submission — no auth required, handled separately in router
function submit(req, res, slug) {
  const form = repo(req).findBySlug(tenant(req), slug);
  if (!form || !form.isActive) {
    return sendJson(res, 404, { error: { code: 'not_found', message: 'Form not found or inactive' } });
  }

  const submissionData = req.body || {};
  const url = new URL(req.url, 'http://localhost');

  // Extract UTM params if present
  const utm = {
    utm_source: url.searchParams.get('utm_source') || submissionData._utm_source || null,
    utm_medium: url.searchParams.get('utm_medium') || submissionData._utm_medium || null,
    utm_campaign: url.searchParams.get('utm_campaign') || submissionData._utm_campaign || null
  };

  // Validate required fields
  const missingFields = form.fields
    .filter(f => f.required && !submissionData[f.name])
    .map(f => f.label || f.name);

  if (missingFields.length > 0) {
    return sendJson(res, 400, {
      error: { code: 'validation_failed', message: `Required fields missing: ${missingFields.join(', ')}` }
    });
  }

  // Attempt contact resolution by email
  let contactId = null;
  if (submissionData.email && req.context.repositories.crmContacts) {
    const existing = req.context.repositories.crmContacts.findByEmail(tenant(req), submissionData.email);
    if (existing) contactId = existing.id;
  }

  const submission = repo(req).recordSubmission(tenant(req), form.id, {
    data: submissionData,
    contact_id: contactId,
    source_url: req.headers['referer'] || null,
    ...utm
  });

  // Attribution if form linked to campaign
  if (form.campaignId && req.context.repositories.campaignAttributions) {
    req.context.repositories.campaignAttributions.record(tenant(req), {
      campaign_id: form.campaignId,
      entity_type: contactId ? 'contact' : 'submission',
      entity_id: contactId || submission.id,
      touch_type: 'form_submit',
      channel: 'form',
      ...utm
    });
  }

  sendJson(res, 201, {
    data: { id: submission.id, message: form.settings?.submit_message || 'Thank you!' },
    redirect_url: form.settings?.redirect_url || null
  });
}

module.exports = { list, get, create, update, remove, listSubmissions, submit };

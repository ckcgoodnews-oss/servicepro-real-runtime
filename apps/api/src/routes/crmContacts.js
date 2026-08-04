const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.crmContacts; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = {
    company_id: url.searchParams.get('company_id') || '',
    lifecycle_stage: url.searchParams.get('lifecycle_stage') || '',
    owner_id: url.searchParams.get('owner_id') || '',
    search: url.searchParams.get('search') || ''
  };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).list(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Contact not found' } }));
}

function create(req, res) {
  const { first_name, last_name, email } = req.body || {};
  if (!first_name && !last_name && !email) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'At least one of first_name, last_name, or email is required' } });
  }
  // Duplicate detection
  Promise.resolve(
    email ? repo(req).findDuplicates(tenant(req), email, req.body.phone) : []
  ).then(duplicates => {
    if (duplicates.length > 0 && !req.body.force_create) {
      return sendJson(res, 409, {
        error: { code: 'duplicate_found', message: 'Possible duplicate contact found' },
        duplicates: duplicates.map(d => ({ id: d.id, email: d.email, firstName: d.firstName, lastName: d.lastName }))
      });
    }
    return Promise.resolve(repo(req).create(tenant(req), req.body))
      .then(data => sendJson(res, 201, { data }));
  });
}

function update(req, res, id) {
  Promise.resolve(repo(req).update(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Contact not found' } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Contact not found' } }));
}

function count(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = {
    lifecycle_stage: url.searchParams.get('lifecycle_stage') || '',
    owner_id: url.searchParams.get('owner_id') || ''
  };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).count(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

module.exports = { list, get, create, update, remove, count };

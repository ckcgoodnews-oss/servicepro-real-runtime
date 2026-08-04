const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
function repo(req) { return req.context.repositories.dataImports; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { entity_type: url.searchParams.get('entity_type') || '', status: url.searchParams.get('status') || '' };
  for (const k of Object.keys(filters)) if (!filters[k]) delete filters[k];
  Promise.resolve(repo(req).list(tenant(req), filters)).then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Import not found' } }));
}

function create(req, res) {
  const { entity_type } = req.body || {};
  if (!entity_type) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'entity_type is required' } });
  const allowed = ['contact', 'company', 'deal', 'ticket', 'job'];
  if (!allowed.includes(entity_type)) return sendJson(res, 400, { error: { code: 'validation_failed', message: `entity_type must be one of: ${allowed.join(', ')}` } });
  const input = { ...req.body, created_by: req.user?.email || null };
  Promise.resolve(repo(req).create(tenant(req), input)).then(data => sendJson(res, 201, { data }));
}

function updateMapping(req, res, id) {
  const { field_mapping } = req.body || {};
  if (!field_mapping) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'field_mapping is required' } });
  Promise.resolve(repo(req).updateMapping(tenant(req), id, field_mapping))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Import not found' } }));
}

function process(req, res, id) {
  const { rows } = req.body || {};
  if (!rows || !Array.isArray(rows)) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'rows array is required' } });

  const imp = repo(req).findById(tenant(req), id);
  if (!imp) return sendJson(res, 404, { error: { code: 'not_found', message: 'Import not found' } });

  // Resolve target repository
  const targetMap = { contact: 'crmContacts', deal: 'deals', ticket: 'tickets', company: 'customers' };
  const targetRepoKey = targetMap[imp.entityType];
  const targetRepo = req.context.repositories[targetRepoKey];
  if (!targetRepo || !targetRepo.create) return sendJson(res, 400, { error: { code: 'no_target', message: `No repository for entity type: ${imp.entityType}` } });

  const result = repo(req).processRows(tenant(req), id, rows, targetRepo, (t, data) => targetRepo.create(t, data));
  sendJson(res, 200, { data: result });
}

module.exports = { list, get, create, updateMapping, process };

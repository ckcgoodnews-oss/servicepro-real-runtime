const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
function repo(req) { return req.context.repositories.callLogs; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { contact_id: url.searchParams.get('contact_id') || '', deal_id: url.searchParams.get('deal_id') || '', caller_id: url.searchParams.get('caller_id') || '', direction: url.searchParams.get('direction') || '', outcome: url.searchParams.get('outcome') || '' };
  for (const k of Object.keys(filters)) if (!filters[k]) delete filters[k];
  Promise.resolve(repo(req).list(tenant(req), filters)).then(data => sendJson(res, 200, { data }));
}
function get(req, res, id) { Promise.resolve(repo(req).findById(tenant(req), id)).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Call log not found' } })); }
function create(req, res) {
  const { caller_id } = req.body || {};
  if (!caller_id) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'caller_id is required' } });
  Promise.resolve(repo(req).create(tenant(req), req.body)).then(data => sendJson(res, 201, { data }));
}
function update(req, res, id) { Promise.resolve(repo(req).update(tenant(req), id, req.body || {})).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Call log not found' } })); }
function stats(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { caller_id: url.searchParams.get('caller_id') || '' };
  for (const k of Object.keys(filters)) if (!filters[k]) delete filters[k];
  Promise.resolve(repo(req).stats(tenant(req), filters)).then(data => sendJson(res, 200, { data }));
}

module.exports = { list, get, create, update, stats };

const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.tickets; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = {
    status: url.searchParams.get('status') || '',
    priority: url.searchParams.get('priority') || '',
    assigned_to: url.searchParams.get('assigned_to') || '',
    customer_id: url.searchParams.get('customer_id') || '',
    category: url.searchParams.get('category') || '',
    channel: url.searchParams.get('channel') || ''
  };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).list(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Ticket not found' } }));
}

function create(req, res) {
  const { subject } = req.body || {};
  if (!subject) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'subject is required' } });
  Promise.resolve(repo(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }));
}

function update(req, res, id) {
  Promise.resolve(repo(req).update(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Ticket not found' } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Ticket not found' } }));
}

function metrics(req, res) {
  Promise.resolve(repo(req).metrics(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function listComments(req, res, ticketId) {
  Promise.resolve(repo(req).listComments(tenant(req), ticketId, true))
    .then(data => sendJson(res, 200, { data }));
}

function addComment(req, res, ticketId) {
  const { content } = req.body || {};
  if (!content) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'content is required' } });
  const input = { ...req.body, author_id: req.body.author_id || req.user?.email || null };
  Promise.resolve(repo(req).addComment(tenant(req), ticketId, input))
    .then(comment => {
      // Record first response if this is the first agent comment
      if (input.author_type !== 'customer') {
        repo(req).recordFirstResponse(tenant(req), ticketId);
      }
      sendJson(res, 201, { data: comment });
    });
}

function listPipelines(req, res) {
  Promise.resolve(repo(req).listPipelines(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function createPipeline(req, res) {
  const { name } = req.body || {};
  if (!name) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name is required' } });
  Promise.resolve(repo(req).createPipeline(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }));
}

function listSlaPolicies(req, res) {
  Promise.resolve(repo(req).listSlaPolicies(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function createSlaPolicy(req, res) {
  const { name } = req.body || {};
  if (!name) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name is required' } });
  Promise.resolve(repo(req).createSlaPolicy(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }));
}

module.exports = { list, get, create, update, remove, metrics, listComments, addComment, listPipelines, createPipeline, listSlaPolicies, createSlaPolicy };

const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.deals; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = {
    pipeline_id: url.searchParams.get('pipeline_id') || '',
    stage: url.searchParams.get('stage') || '',
    status: url.searchParams.get('status') || '',
    owner_id: url.searchParams.get('owner_id') || ''
  };
  // Remove empty filters
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).list(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Deal not found' } }));
}

function create(req, res) {
  const { name } = req.body || {};
  if (!name) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name is required' } });
  Promise.resolve(repo(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }));
}

function update(req, res, id) {
  Promise.resolve(repo(req).update(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Deal not found' } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Deal not found' } }));
}

function forecast(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = {
    pipeline_id: url.searchParams.get('pipeline_id') || '',
    owner_id: url.searchParams.get('owner_id') || ''
  };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).forecast(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function listPipelines(req, res) {
  Promise.resolve(repo(req).listPipelines(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function getPipeline(req, res, id) {
  Promise.resolve(repo(req).getPipeline(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Pipeline not found' } }));
}

function createPipeline(req, res) {
  const { name } = req.body || {};
  if (!name) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name is required' } });
  Promise.resolve(repo(req).createPipeline(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }));
}

function updatePipeline(req, res, id) {
  Promise.resolve(repo(req).updatePipeline(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Pipeline not found' } }));
}

function listProducts(req, res, dealId) {
  Promise.resolve(repo(req).listProducts(tenant(req), dealId))
    .then(data => sendJson(res, 200, { data }));
}

function addProduct(req, res, dealId) {
  const { name } = req.body || {};
  if (!name) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name is required' } });
  Promise.resolve(repo(req).addProduct(tenant(req), dealId, req.body))
    .then(data => sendJson(res, 201, { data }));
}

function removeProduct(req, res, productId) {
  Promise.resolve(repo(req).removeProduct(tenant(req), productId))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Product not found' } }));
}

module.exports = { list, get, create, update, remove, forecast, listPipelines, getPipeline, createPipeline, updatePipeline, listProducts, addProduct, removeProduct };

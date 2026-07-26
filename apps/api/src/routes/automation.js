const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.automation; }
function tenant(req) { return operationalTenant(req); }

function listWorkflows(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { status: url.searchParams.get('status') || '', trigger: url.searchParams.get('trigger') || '' };
  Promise.resolve(repo(req).listWorkflows(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function getWorkflow(req, res, id) {
  Promise.resolve(repo(req).findWorkflowById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Workflow not found' } }));
}

function createWorkflow(req, res) {
  Promise.resolve(repo(req).createWorkflow(tenant(req), { ...req.body, createdBy: req.context.userId || '' }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function updateWorkflow(req, res, id) {
  Promise.resolve(repo(req).updateWorkflow(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Workflow not found' } }));
}

function deleteWorkflow(req, res, id) {
  Promise.resolve(repo(req).deleteWorkflow(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Workflow not found' } }));
}

function executeWorkflow(req, res, id) {
  Promise.resolve(repo(req).executeWorkflow(tenant(req), id, req.body || {}))
    .then(data => {
      if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Workflow not found' } });
      return sendJson(res, 200, { data });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function listExecutions(req, res, workflowId) {
  Promise.resolve(repo(req).listExecutions(tenant(req), workflowId))
    .then(data => sendJson(res, 200, { data }));
}

function getTriggers(req, res) {
  sendJson(res, 200, { data: repo(req).getAvailableTriggers() });
}

function getActions(req, res) {
  sendJson(res, 200, { data: repo(req).getAvailableActions() });
}

module.exports = { listWorkflows, getWorkflow, createWorkflow, updateWorkflow, deleteWorkflow, executeWorkflow, listExecutions, getTriggers, getActions };

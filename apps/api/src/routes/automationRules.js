const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
function repo(req) { return req.context.repositories.automationRules; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { trigger_type: url.searchParams.get('trigger_type') || '' };
  for (const k of Object.keys(filters)) if (!filters[k]) delete filters[k];
  Promise.resolve(repo(req).list(tenant(req), filters)).then(data => sendJson(res, 200, { data }));
}
function get(req, res, id) { Promise.resolve(repo(req).findById(tenant(req), id)).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Rule not found' } })); }
function create(req, res) {
  const { name, trigger_type } = req.body || {};
  if (!name || !trigger_type) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name and trigger_type are required' } });
  Promise.resolve(repo(req).create(tenant(req), req.body)).then(data => sendJson(res, 201, { data }));
}
function update(req, res, id) { Promise.resolve(repo(req).update(tenant(req), id, req.body || {})).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Rule not found' } })); }
function remove(req, res, id) { Promise.resolve(repo(req).delete(tenant(req), id)).then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Rule not found' } })); }
function listExecutions(req, res, id) { Promise.resolve(repo(req).listExecutions(tenant(req), id)).then(data => sendJson(res, 200, { data })); }
function trigger(req, res) {
  const { trigger_type, trigger_data } = req.body || {};
  if (!trigger_type) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'trigger_type is required' } });
  const rules = repo(req).findByTrigger(tenant(req), trigger_type);
  const results = [];
  for (const rule of rules) {
    const conditionsMet = evaluateConditions(rule.conditions, trigger_data || {});
    const actionsResult = conditionsMet ? rule.actions.map(a => ({ action_type: a.type, status: 'executed', config: a.config })) : [];
    const status = conditionsMet ? 'success' : 'skipped';
    const exec = repo(req).recordExecution(tenant(req), rule.id, trigger_data || {}, conditionsMet, actionsResult, status);
    results.push(exec);
  }
  sendJson(res, 200, { data: { rules_evaluated: rules.length, executions: results } });
}

function evaluateConditions(conditions, data) {
  if (!conditions || !conditions.length) return true;
  return conditions.every(c => {
    const val = data[c.field];
    switch (c.operator) {
      case 'equals': return val === c.value;
      case 'not_equals': return val !== c.value;
      case 'contains': return String(val || '').includes(c.value);
      case 'greater_than': return Number(val) > Number(c.value);
      case 'less_than': return Number(val) < Number(c.value);
      default: return true;
    }
  });
}

module.exports = { list, get, create, update, remove, listExecutions, trigger };

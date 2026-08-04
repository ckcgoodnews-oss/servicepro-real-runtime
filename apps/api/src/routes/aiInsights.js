const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
const aiInsightService = require('../services/aiInsightService');

function repo(req) { return req.context.repositories.aiInsights; }
function tenant(req) { return operationalTenant(req); }

// List active insights, filterable by entity/type/severity
function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = {
    entity_type: url.searchParams.get('entity_type') || '',
    entity_id: url.searchParams.get('entity_id') || '',
    insight_type: url.searchParams.get('insight_type') || '',
    severity: url.searchParams.get('severity') || '',
    status: url.searchParams.get('status') || ''
  };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).list(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function counts(req, res) {
  Promise.resolve(repo(req).counts(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Insight not found' } }));
}

// Mark an insight as dismissed or acted-on
function updateStatus(req, res, id) {
  const { status } = req.body || {};
  const allowed = ['dismissed', 'acted_on'];
  if (!status || !allowed.includes(status)) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: `status must be one of: ${allowed.join(', ')}` } });
  }
  const userId = req.user?.email || null;
  Promise.resolve(repo(req).updateStatus(tenant(req), id, status, userId))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Insight not found' } }));
}

// Generate insights for a specific entity on demand
function generate(req, res) {
  const { entity_type, entity_id } = req.body || {};
  if (!entity_type || !entity_id) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'entity_type and entity_id are required' } });
  }

  const t = tenant(req);
  const repos = req.context.repositories;
  const generatedInsights = [];

  try {
    if (entity_type === 'deal') {
      const deal = repos.deals?.findById(t, entity_id);
      if (deal) {
        // Deal risk
        const riskInsight = aiInsightService.scoreDealRisk(deal);
        if (riskInsight.confidence > 0.1) {
          const stored = repo(req).upsert(t, riskInsight);
          generatedInsights.push(stored);
        }
        // Next action
        const activities = repos.activityTimeline?.list(t, 'deal', entity_id, { limit: 5 }) || [];
        const actionInsight = aiInsightService.suggestNextAction(deal, activities);
        const stored = repo(req).upsert(t, actionInsight);
        generatedInsights.push(stored);
      }
    } else if (entity_type === 'ticket') {
      const ticket = repos.tickets?.findById(t, entity_id);
      if (ticket) {
        const routingInsight = aiInsightService.suggestTicketRouting(ticket);
        const stored = repo(req).upsert(t, routingInsight);
        generatedInsights.push(stored);
      }
    } else if (entity_type === 'customer') {
      const tickets = repos.tickets?.list(t, { customer_id: entity_id }) || [];
      const invoices = repos.invoices?.list?.(t) || [];
      const jobs = repos.jobs?.list?.(t) || [];
      // Minimal customer object for scoring
      const customer = { id: entity_id };
      const churnInsight = aiInsightService.scoreChurnRisk(customer, tickets, invoices, jobs);
      if (churnInsight.confidence > 0.1) {
        const stored = repo(req).upsert(t, churnInsight);
        generatedInsights.push(stored);
      }
    }
  } catch (err) {
    return sendJson(res, 500, { error: { code: 'generation_failed', message: err.message } });
  }

  sendJson(res, 200, { data: generatedInsights, generated: generatedInsights.length });
}

// Bulk generate insights for all active deals
function generateBulkDeals(req, res) {
  const t = tenant(req);
  const repos = req.context.repositories;
  const deals = repos.deals?.list(t, { status: 'open' }) || [];
  const results = [];

  for (const deal of deals) {
    try {
      const riskInsight = aiInsightService.scoreDealRisk(deal);
      if (riskInsight.confidence > 0.15) {
        results.push(repo(req).upsert(t, riskInsight));
      }
    } catch { /* skip individual failures */ }
  }

  sendJson(res, 200, { data: { generated: results.length, deals_scanned: deals.length } });
}

module.exports = { list, counts, get, updateStatus, generate, generateBulkDeals };

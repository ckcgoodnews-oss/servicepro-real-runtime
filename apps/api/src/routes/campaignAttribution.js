const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.campaignAttributions; }
function tenant(req) { return operationalTenant(req); }

function record(req, res) {
  const { campaign_id, entity_type, entity_id, touch_type } = req.body || {};
  if (!campaign_id || !entity_type || !entity_id || !touch_type) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'campaign_id, entity_type, entity_id, and touch_type are required' } });
  }
  Promise.resolve(repo(req).record(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }));
}

function listForCampaign(req, res, campaignId) {
  Promise.resolve(repo(req).listForCampaign(tenant(req), campaignId))
    .then(data => sendJson(res, 200, { data }));
}

function listForEntity(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const entityType = url.searchParams.get('entity_type');
  const entityId = url.searchParams.get('entity_id');
  if (!entityType || !entityId) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'entity_type and entity_id are required' } });
  }
  Promise.resolve(repo(req).listForEntity(tenant(req), entityType, entityId))
    .then(data => sendJson(res, 200, { data }));
}

function summary(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = {
    campaign_id: url.searchParams.get('campaign_id') || '',
    channel: url.searchParams.get('channel') || ''
  };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).summary(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function sendStats(req, res, campaignId) {
  Promise.resolve(repo(req).sendStats(tenant(req), campaignId))
    .then(data => sendJson(res, 200, { data }));
}

module.exports = { record, listForCampaign, listForEntity, summary, sendStats };

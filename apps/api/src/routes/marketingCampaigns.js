const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
const { notify } = require('../services/notificationService');

function repo(req) { return req.context.repositories.marketingCampaigns; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { status: url.searchParams.get('status') || '', type: url.searchParams.get('type') || '' };
  Promise.resolve(repo(req).listCampaigns(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function getById(req, res, id) {
  Promise.resolve(repo(req).findCampaignById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Campaign not found' } }));
}

function create(req, res) {
  Promise.resolve(repo(req).createCampaign(tenant(req), { ...req.body, createdBy: req.context.userId || '' }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function update(req, res, id) {
  Promise.resolve(repo(req).updateCampaign(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Campaign not found' } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).deleteCampaign(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Campaign not found' } }));
}

function stats(req, res) {
  Promise.resolve(repo(req).getStats(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function send(req, res, id) {
  Promise.resolve()
    .then(async () => {
      const campaign = await repo(req).findCampaignById(tenant(req), id);
      if (!campaign) return sendJson(res, 404, { error: { code: 'not_found', message: 'Campaign not found' } });
      if (campaign.status === 'completed') return sendJson(res, 400, { error: { code: 'already_sent', message: 'Campaign already completed' } });

      // Get audience
      const customers = await req.context.repositories.customers.list(tenant(req));
      let recipients = customers.filter(c => c.email);

      // Send notifications
      let sentCount = 0;
      for (const customer of recipients) {
        await notify(campaign.type === 'sms' ? 'sms' : 'email', customer.email || customer.phone, {
          subject: campaign.subject,
          body: campaign.body
        }, { customerName: `${customer.firstName} ${customer.lastName}`, companyName: 'ServicePro' });
        sentCount++;
      }

      // Update campaign status
      const updated = await repo(req).updateCampaign(tenant(req), id, { status: 'active', sentCount });
      return sendJson(res, 200, { data: { ...updated, recipientCount: sentCount } });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: 'send_failed', message: err.message } }));
}

module.exports = { list, getById, create, update, remove, stats, send };

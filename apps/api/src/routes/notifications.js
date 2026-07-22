const { sendJson } = require('../utils/http');
const { buildNotificationFromTemplate } = require('../services/templateService');
const { operationalTenant } = require('../services/tenantResolver');

function tenant(req) { return operationalTenant(req); }

function listTemplates(req, res) {
  Promise.resolve(req.context.repositories.messageTemplates.list(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function createTemplate(req, res) {
  Promise.resolve()
    .then(() => req.context.repositories.messageTemplates.create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function listNotifications(req, res) {
  Promise.resolve(req.context.repositories.notifications.list(tenant(req), { toAddress: req.context.email }))
    .then(data => sendJson(res, 200, { data }));
}

function markRead(req, res, id) {
  Promise.resolve(req.context.repositories.notifications.markRead(tenant(req), id, req.context.email))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Notification not found' } }));
}

function markAllRead(req, res) {
  Promise.resolve(req.context.repositories.notifications.markAllRead(tenant(req), req.context.email))
    .then(count => sendJson(res, 200, { data: { count } }));
}

function queueNotification(req, res) {
  Promise.resolve()
    .then(async () => {
      if (req.body.templateKey) {
        const template = await req.context.repositories.messageTemplates.findByKey(tenant(req), req.body.templateKey);
        if (!template) {
          const err = new Error('Message template not found');
          err.status = 404;
          err.code = 'not_found';
          throw err;
        }
        const rendered = buildNotificationFromTemplate(template, {
          toAddress: req.body.toAddress,
          toName: req.body.toName || ''
        }, req.body.data || {});
        return req.context.repositories.notifications.create(tenant(req), rendered);
      }

      return req.context.repositories.notifications.create(tenant(req), req.body);
    })
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function processQueued(req, res) {
  const limit = Number(req.body.limit || 25);
  Promise.resolve()
    .then(async () => {
      const queued = await req.context.repositories.notifications.pending(tenant(req), limit);
      const processed = [];
      for (const notification of queued) {
        const updated = await req.context.repositories.notifications.updateStatus(tenant(req), notification.id, 'sent');
        processed.push(updated);
      }
      return processed;
    })
    .then(data => sendJson(res, 200, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

module.exports = { listTemplates, createTemplate, listNotifications, queueNotification, processQueued, markRead, markAllRead };

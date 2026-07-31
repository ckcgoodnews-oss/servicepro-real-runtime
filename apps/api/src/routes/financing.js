const { sendJson } = require('../utils/http');

async function listApplications(req, res) {
  const apps = await req.context.repositories.financing.list(req.context.tenantId);
  return sendJson(res, 200, { data: apps });
}

async function submitApplication(req, res, slug) {
  const app = await req.context.repositories.financing.submit(slug, req.body);
  if (!app) return sendJson(res, 404, { error: { code: 'not_found', message: 'Business not found' } });
  return sendJson(res, 201, { data: app });
}

async function updateStatus(req, res, id) {
  const app = await req.context.repositories.financing.updateStatus(req.context.tenantId, id, req.body.status, req.body.notes);
  return app ? sendJson(res, 200, { data: app }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Application not found' } });
}

module.exports = { listApplications, submitApplication, updateStatus };

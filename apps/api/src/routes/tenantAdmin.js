const { sendJson } = require('../utils/http');
const { publicTenantProfile } = require('../services/tenantSettingsService');

function tenant(req) {
  return req.context.tenantId;
}

function getPublicProfile(req, res) {
  Promise.resolve(req.context.repositories.tenantSettings.get(tenant(req)))
    .then(settings => sendJson(res, 200, { data: publicTenantProfile(settings) }));
}

function getSettings(req, res) {
  Promise.resolve(req.context.repositories.tenantSettings.get(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function updateSettings(req, res) {
  Promise.resolve(req.context.repositories.tenantSettings.upsert(tenant(req), req.body))
    .then(data => sendJson(res, 200, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function updateBranding(req, res) {
  Promise.resolve()
    .then(async () => {
      const current = await req.context.repositories.tenantSettings.get(tenant(req));
      return req.context.repositories.tenantSettings.upsert(tenant(req), {
        branding: {
          ...(current.branding || {}),
          ...(req.body || {})
        }
      });
    })
    .then(data => sendJson(res, 200, { data: data.branding }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function updateFeatures(req, res) {
  Promise.resolve()
    .then(async () => {
      const current = await req.context.repositories.tenantSettings.get(tenant(req));
      return req.context.repositories.tenantSettings.upsert(tenant(req), {
        features: {
          ...(current.features || {}),
          ...(req.body || {})
        }
      });
    })
    .then(data => sendJson(res, 200, { data: data.features }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

module.exports = { getPublicProfile, getSettings, updateSettings, updateBranding, updateFeatures };

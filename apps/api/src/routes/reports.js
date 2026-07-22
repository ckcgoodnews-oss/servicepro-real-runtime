const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.reports; }
function tenant(req) { return operationalTenant(req); }

function catalog(req, res) {
  Promise.resolve(repo(req).catalog()).then(data => sendJson(res, 200, { data }));
}

function dashboard(req, res) {
  Promise.resolve(repo(req).dashboard(tenant(req))).then(data => sendJson(res, 200, { data }));
}

function run(req, res, key) {
  const reports = repo(req);
  const map = {
    dashboard: () => reports.dashboard(tenant(req)),
    revenue: () => reports.revenue(tenant(req)),
    'jobs-by-status': () => reports.jobsByStatus(tenant(req)),
    'inventory-value': () => reports.inventoryValue(tenant(req)),
    'portal-bookings': () => reports.portalBookings(tenant(req))
  };
  if (!map[key]) return sendJson(res, 404, { error: { code: 'not_found', message: 'Report not found' } });
  Promise.resolve(map[key]()).then(data => sendJson(res, 200, { data }));
}

module.exports = { catalog, dashboard, run };

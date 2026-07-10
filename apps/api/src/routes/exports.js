const { sendJson } = require('../utils/http');
const { csvResponsePayload } = require('../services/csvExportService');

function tenant(req) { return req.context.tenantId; }

async function rowsForExport(req, key) {
  const repos = req.context.repositories;
  const tenantId = tenant(req);

  if (key === 'customers') return repos.customers.list(tenantId);
  if (key === 'jobs') return repos.jobs.list(tenantId);
  if (key === 'invoices') return repos.invoices.list(tenantId);
  if (key === 'payments') return repos.payments.list(tenantId);
  if (key === 'inventory') return repos.inventory.list(tenantId);
  if (key === 'portal-bookings') return repos.portalBookings.list(tenantId);

  if (key === 'report-revenue') return [await repos.reports.revenue(tenantId)];
  if (key === 'report-dashboard') return [await repos.reports.dashboard(tenantId)];
  if (key === 'report-inventory-value') return [await repos.reports.inventoryValue(tenantId)];

  const err = new Error('Export key not found');
  err.status = 404;
  err.code = 'not_found';
  throw err;
}

function list(req, res) {
  Promise.resolve(req.context.repositories.exports.list(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function create(req, res) {
  const key = req.body.exportKey || req.body.key;
  Promise.resolve()
    .then(async () => {
      const rows = await rowsForExport(req, key);
      const filename = `${key}-${new Date().toISOString().slice(0, 10)}.csv`;
      const payload = csvResponsePayload(filename, rows);
      const run = await req.context.repositories.exports.create(tenant(req), {
        exportKey: key,
        filename,
        rowCount: payload.rowCount,
        createdBy: req.context.userId || ''
      });
      return { exportRun: run, export: payload };
    })
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

module.exports = { list, create };

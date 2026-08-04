const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.customDashboards; }
function tenant(req) { return operationalTenant(req); }

// --- Dashboards ---
function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { owner_id: url.searchParams.get('owner_id') || '' };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).list(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Dashboard not found' } }));
}

function create(req, res) {
  const { name } = req.body || {};
  if (!name) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name is required' } });
  const input = { ...req.body, owner_id: req.body.owner_id || req.user?.email || null };
  Promise.resolve(repo(req).create(tenant(req), input))
    .then(data => sendJson(res, 201, { data }));
}

function update(req, res, id) {
  Promise.resolve(repo(req).update(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Dashboard not found' } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Dashboard not found' } }));
}

// --- Widgets ---
function listWidgets(req, res, dashboardId) {
  Promise.resolve(repo(req).listWidgets(tenant(req), dashboardId))
    .then(data => sendJson(res, 200, { data }));
}

function addWidget(req, res, dashboardId) {
  const { widget_type, title, data_source } = req.body || {};
  if (!widget_type || !title || !data_source) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'widget_type, title, and data_source are required' } });
  }
  Promise.resolve(repo(req).addWidget(tenant(req), dashboardId, req.body))
    .then(data => sendJson(res, 201, { data }));
}

function updateWidget(req, res, widgetId) {
  Promise.resolve(repo(req).updateWidget(tenant(req), widgetId, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Widget not found' } }));
}

function removeWidget(req, res, widgetId) {
  Promise.resolve(repo(req).removeWidget(tenant(req), widgetId))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Widget not found' } }));
}

// --- Widget Data Resolver ---
// Aggregates data from other repositories to feed widget visualizations
function widgetData(req, res, widgetId) {
  const widget = repo(req).listWidgets(tenant(req), null)?.find?.(w => w.id === widgetId) ||
    (() => { /* check all dashboards */ const all = []; for (const db of repo(req).list(tenant(req), {})) all.push(...(repo(req).listWidgets(tenant(req), db.id) || [])); return all.find(w => w.id === widgetId); })();

  if (!widget) return sendJson(res, 404, { error: { code: 'not_found', message: 'Widget not found' } });

  const t = tenant(req);
  const repos = req.context.repositories;
  let result = {};

  try {
    switch (widget.dataSource) {
      case 'deals': {
        const deals = repos.deals?.list(t, {}) || [];
        result = aggregateByField(deals, widget.config?.group_by || 'stage', widget.widgetType);
        break;
      }
      case 'tickets': {
        const tickets = repos.tickets?.list(t, {}) || [];
        result = aggregateByField(tickets, widget.config?.group_by || 'status', widget.widgetType);
        break;
      }
      case 'jobs': {
        const jobs = repos.jobs?.list?.(t) || [];
        result = aggregateByField(jobs, widget.config?.group_by || 'status', widget.widgetType);
        break;
      }
      case 'contacts': {
        const contacts = repos.crmContacts?.list(t, {}) || [];
        result = aggregateByField(contacts, widget.config?.group_by || 'lifecycleStage', widget.widgetType);
        break;
      }
      case 'activities': {
        const acts = repos.activityTimeline?.recent(t, 50) || [];
        result = { items: acts.slice(0, widget.config?.limit || 10), total: acts.length };
        break;
      }
      default:
        result = { message: `Data source '${widget.dataSource}' not resolved` };
    }
  } catch {
    result = { error: 'Data resolution failed' };
  }

  sendJson(res, 200, { data: { widget_id: widgetId, widget_type: widget.widgetType, data_source: widget.dataSource, result } });
}

function aggregateByField(items, field, widgetType) {
  const counts = {};
  let total = 0;
  for (const item of items) {
    const val = item[field] || 'unknown';
    counts[val] = (counts[val] || 0) + 1;
    total++;
  }
  if (widgetType === 'kpi') return { value: total, label: `Total ${items[0]?.constructor?.name || 'items'}` };
  return { labels: Object.keys(counts), values: Object.values(counts), total };
}

module.exports = { list, get, create, update, remove, listWidgets, addWidget, updateWidget, removeWidget, widgetData };

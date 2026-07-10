const { makeId, now } = require('../services/id');
const {
  normalizeDashboardInput,
  normalizeDashboardWidgetInput,
  normalizeMetricSnapshotInput,
  enrichMetricSnapshot,
  summarizeMetrics,
  renderDashboard
} = require('../services/biDashboardService');

function createBiDashboardRepository(store) {
  if (store.type === 'json') return createJsonBiDashboardRepository(store);
  if (store.type === 'postgres') return createPostgresBiDashboardRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureBi(data) {
  if (!data.biDashboards) data.biDashboards = [];
  if (!data.biDashboardWidgets) data.biDashboardWidgets = [];
  if (!data.biMetricSnapshots) data.biMetricSnapshots = [];
  return data;
}

function createJsonBiDashboardRepository(store) {
  return {
    listDashboards(tenantId, filters = {}) {
      return ensureBi(store.read()).biDashboards
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.category || x.category === filters.category)
        .filter(x => filters.active === undefined || x.active === filters.active)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    findDashboardById(tenantId, id) {
      return ensureBi(store.read()).biDashboards.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    createDashboard(tenantId, input) {
      const data = ensureBi(store.read());
      const dashboard = { id: makeId('bidash'), tenantId, ...normalizeDashboardInput(input), createdAt: now(), updatedAt: now() };
      data.biDashboards.push(dashboard);
      store.write(data);
      return dashboard;
    },
    listWidgets(tenantId, dashboardId) {
      return ensureBi(store.read()).biDashboardWidgets
        .filter(x => x.tenantId === tenantId && x.dashboardId === dashboardId)
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
    },
    createWidget(tenantId, input) {
      const data = ensureBi(store.read());
      const widget = { id: makeId('biwidget'), tenantId, ...normalizeDashboardWidgetInput(input), createdAt: now(), updatedAt: now() };
      data.biDashboardWidgets.push(widget);
      store.write(data);
      return widget;
    },
    listMetricSnapshots(tenantId, filters = {}) {
      return ensureBi(store.read()).biMetricSnapshots
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.metricKey || x.metricKey === filters.metricKey)
        .filter(x => !filters.source || x.source === filters.source)
        .sort((a, b) => String(b.capturedAt).localeCompare(String(a.capturedAt)));
    },
    captureMetric(tenantId, input) {
      const data = ensureBi(store.read());
      const snapshot = { id: makeId('bimetric'), tenantId, ...enrichMetricSnapshot(normalizeMetricSnapshotInput(input)), createdAt: now(), updatedAt: now() };
      data.biMetricSnapshots.push(snapshot);
      store.write(data);
      return snapshot;
    },
    render(tenantId, dashboardId) {
      const dashboard = this.findDashboardById(tenantId, dashboardId);
      if (!dashboard) return null;
      const widgets = this.listWidgets(tenantId, dashboardId);
      const snapshots = this.listMetricSnapshots(tenantId);
      return renderDashboard({ dashboard, widgets, snapshots });
    },
    summary(tenantId, filters = {}) {
      return summarizeMetrics(this.listMetricSnapshots(tenantId, filters));
    }
  };
}

function createPostgresBiDashboardRepository(store) {
  const dashboardSelect = `SELECT id::text, tenant_id as "tenantId", code, name, description, category,
    active, role_visibility as "roleVisibility", layout, filters, metadata,
    created_at as "createdAt", updated_at as "updatedAt" FROM bi_dashboards`;

  const widgetSelect = `SELECT id::text, tenant_id as "tenantId", dashboard_id::text as "dashboardId",
    title, widget_type as "widgetType", metric_key as "metricKey", sort_order as "sortOrder",
    width, height, config, metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM bi_dashboard_widgets`;

  const metricSelect = `SELECT id::text, tenant_id as "tenantId", metric_key as "metricKey", label,
    value::float, value_type as "valueType", previous_value::float as "previousValue",
    target_value::float as "targetValue", percent_change::float as "percentChange",
    target_progress_percent::float as "targetProgressPercent", period_start as "periodStart",
    period_end as "periodEnd", dimensions, source, captured_at as "capturedAt",
    metadata, created_at as "createdAt", updated_at as "updatedAt" FROM bi_metric_snapshots`;

  return {
    async listDashboards(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      if (filters.category) {
        params.push(filters.category);
        where += ` AND category = $${params.length}`;
      }
      if (filters.active !== undefined) {
        params.push(filters.active);
        where += ` AND active = $${params.length}`;
      }
      const result = await store.query(`${dashboardSelect} ${where} ORDER BY name`, params);
      return result.rows;
    },
    async findDashboardById(tenantId, id) {
      const result = await store.query(`${dashboardSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createDashboard(tenantId, input) {
      const x = normalizeDashboardInput(input);
      const result = await store.query(
        `INSERT INTO bi_dashboards
         (tenant_id, code, name, description, category, active, role_visibility, layout, filters, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10::jsonb)
         RETURNING id::text, tenant_id as "tenantId", code, name, description, category,
                   active, role_visibility as "roleVisibility", layout, filters, metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.description, x.category, x.active, JSON.stringify(x.roleVisibility || []),
          JSON.stringify(x.layout || {}), JSON.stringify(x.filters || {}), JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listWidgets(tenantId, dashboardId) {
      const result = await store.query(`${widgetSelect} WHERE tenant_id = $1 AND dashboard_id = $2 ORDER BY sort_order`, [tenantId, dashboardId]);
      return result.rows;
    },
    async createWidget(tenantId, input) {
      const x = normalizeDashboardWidgetInput(input);
      const result = await store.query(
        `INSERT INTO bi_dashboard_widgets
         (tenant_id, dashboard_id, title, widget_type, metric_key, sort_order, width, height, config, metadata)
         VALUES ($1,$2::uuid,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb)
         RETURNING id::text, tenant_id as "tenantId", dashboard_id::text as "dashboardId",
                   title, widget_type as "widgetType", metric_key as "metricKey", sort_order as "sortOrder",
                   width, height, config, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.dashboardId, x.title, x.widgetType, x.metricKey, x.sortOrder, x.width, x.height,
          JSON.stringify(x.config || {}), JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listMetricSnapshots(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      if (filters.metricKey) {
        params.push(filters.metricKey);
        where += ` AND metric_key = $${params.length}`;
      }
      if (filters.source) {
        params.push(filters.source);
        where += ` AND source = $${params.length}`;
      }
      const result = await store.query(`${metricSelect} ${where} ORDER BY captured_at DESC`, params);
      return result.rows;
    },
    async captureMetric(tenantId, input) {
      const x = enrichMetricSnapshot(normalizeMetricSnapshotInput(input));
      const result = await store.query(
        `INSERT INTO bi_metric_snapshots
         (tenant_id, metric_key, label, value, value_type, previous_value, target_value, percent_change,
          target_progress_percent, period_start, period_end, dimensions, source, captured_at, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NULLIF($10,'')::date,NULLIF($11,'')::date,$12::jsonb,$13,$14::timestamptz,$15::jsonb)
         RETURNING id::text, tenant_id as "tenantId", metric_key as "metricKey", label,
                   value::float, value_type as "valueType", previous_value::float as "previousValue",
                   target_value::float as "targetValue", percent_change::float as "percentChange",
                   target_progress_percent::float as "targetProgressPercent", period_start as "periodStart",
                   period_end as "periodEnd", dimensions, source, captured_at as "capturedAt",
                   metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.metricKey, x.label, x.value, x.valueType, x.previousValue, x.targetValue,
          x.percentChange, x.targetProgressPercent, x.periodStart, x.periodEnd, JSON.stringify(x.dimensions || {}),
          x.source, x.capturedAt, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async render(tenantId, dashboardId) {
      const dashboard = await this.findDashboardById(tenantId, dashboardId);
      if (!dashboard) return null;
      const widgets = await this.listWidgets(tenantId, dashboardId);
      const snapshots = await this.listMetricSnapshots(tenantId);
      return renderDashboard({ dashboard, widgets, snapshots });
    },
    async summary(tenantId, filters = {}) {
      const snapshots = await this.listMetricSnapshots(tenantId, filters);
      return summarizeMetrics(snapshots);
    }
  };
}

module.exports = { createBiDashboardRepository };

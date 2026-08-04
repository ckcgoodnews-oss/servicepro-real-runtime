const { makeId, now } = require('../services/id');

function createDashboardRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId, filters = {}) {
      const d = data();
      d.customDashboards ||= [];
      let results = d.customDashboards.filter(db => db.tenantId === tenantId);
      if (filters.owner_id) results = results.filter(db => db.ownerId === filters.owner_id);
      return results.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0) || (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },

    findById(tenantId, id) {
      const d = data();
      d.customDashboards ||= [];
      const dashboard = d.customDashboards.find(db => db.tenantId === tenantId && db.id === id);
      if (!dashboard) return null;
      // Attach widgets
      d.dashboardWidgets ||= [];
      dashboard.widgets = d.dashboardWidgets.filter(w => w.dashboardId === dashboard.id);
      return dashboard;
    },

    create(tenantId, input) {
      const d = data();
      d.customDashboards ||= [];
      const dashboard = {
        id: makeId('dash'),
        tenantId,
        name: input.name || 'New Dashboard',
        description: input.description || '',
        layout: input.layout || [],
        isDefault: !!input.is_default,
        ownerId: input.owner_id || null,
        sharedWith: input.shared_with || [],
        createdAt: now(),
        updatedAt: now()
      };
      d.customDashboards.push(dashboard);
      save(d);
      return dashboard;
    },

    update(tenantId, id, input) {
      const d = data();
      d.customDashboards ||= [];
      const idx = d.customDashboards.findIndex(db => db.tenantId === tenantId && db.id === id);
      if (idx === -1) return null;
      const db = d.customDashboards[idx];
      if (input.name !== undefined) db.name = input.name;
      if (input.description !== undefined) db.description = input.description;
      if (input.layout !== undefined) db.layout = input.layout;
      if (input.is_default !== undefined) db.isDefault = !!input.is_default;
      if (input.shared_with !== undefined) db.sharedWith = input.shared_with;
      db.updatedAt = now();
      save(d);
      return db;
    },

    delete(tenantId, id) {
      const d = data();
      d.customDashboards ||= [];
      const idx = d.customDashboards.findIndex(db => db.tenantId === tenantId && db.id === id);
      if (idx === -1) return null;
      d.customDashboards.splice(idx, 1);
      d.dashboardWidgets = (d.dashboardWidgets || []).filter(w => w.dashboardId !== id);
      save(d);
      return { deleted: true };
    },

    // Widgets
    listWidgets(tenantId, dashboardId) {
      const d = data();
      d.dashboardWidgets ||= [];
      return d.dashboardWidgets.filter(w => w.tenantId === tenantId && w.dashboardId === dashboardId);
    },

    addWidget(tenantId, dashboardId, input) {
      const d = data();
      d.dashboardWidgets ||= [];
      const widget = {
        id: makeId('widget'),
        tenantId,
        dashboardId,
        widgetType: input.widget_type || 'kpi',
        title: input.title || '',
        dataSource: input.data_source || 'deals',
        config: input.config || {},
        position: input.position || { x: 0, y: 0, w: 4, h: 3 },
        refreshInterval: input.refresh_interval || 0,
        createdAt: now(),
        updatedAt: now()
      };
      d.dashboardWidgets.push(widget);
      save(d);
      return widget;
    },

    updateWidget(tenantId, widgetId, input) {
      const d = data();
      d.dashboardWidgets ||= [];
      const idx = d.dashboardWidgets.findIndex(w => w.tenantId === tenantId && w.id === widgetId);
      if (idx === -1) return null;
      const widget = d.dashboardWidgets[idx];
      if (input.title !== undefined) widget.title = input.title;
      if (input.config !== undefined) widget.config = { ...widget.config, ...input.config };
      if (input.position !== undefined) widget.position = input.position;
      if (input.refresh_interval !== undefined) widget.refreshInterval = input.refresh_interval;
      widget.updatedAt = now();
      save(d);
      return widget;
    },

    removeWidget(tenantId, widgetId) {
      const d = data();
      d.dashboardWidgets ||= [];
      const idx = d.dashboardWidgets.findIndex(w => w.tenantId === tenantId && w.id === widgetId);
      if (idx === -1) return null;
      d.dashboardWidgets.splice(idx, 1);
      save(d);
      return { deleted: true };
    }
  };
}

function createPostgresImpl(store) { return createJsonImpl(store); }
module.exports = { createDashboardRepository };

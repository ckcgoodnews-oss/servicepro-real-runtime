const { makeId, now } = require('../services/id');

function createActivityTimelineRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId, entityType, entityId, filters = {}) {
      const d = data();
      d.activityTimeline ||= [];
      let results = d.activityTimeline.filter(a =>
        a.tenantId === tenantId && a.entityType === entityType && a.entityId === entityId
      );
      if (filters.activity_type) results = results.filter(a => a.activityType === filters.activity_type);
      results.sort((a, b) => (b.performedAt || '').localeCompare(a.performedAt || ''));
      if (filters.limit) results = results.slice(0, filters.limit);
      return results;
    },

    create(tenantId, input) {
      const d = data();
      d.activityTimeline ||= [];
      const activity = {
        id: makeId('activity'),
        tenantId,
        entityType: input.entity_type,
        entityId: input.entity_id,
        activityType: input.activity_type,
        title: input.title || null,
        description: input.description || null,
        metadata: input.metadata || {},
        performedBy: input.performed_by || null,
        performedAt: input.performed_at || now(),
        createdAt: now()
      };
      d.activityTimeline.push(activity);
      save(d);
      return activity;
    },

    recent(tenantId, limit = 50) {
      const d = data();
      d.activityTimeline ||= [];
      return d.activityTimeline
        .filter(a => a.tenantId === tenantId)
        .sort((a, b) => (b.performedAt || '').localeCompare(a.performedAt || ''))
        .slice(0, limit);
    },

    forUser(tenantId, userId, limit = 50) {
      const d = data();
      d.activityTimeline ||= [];
      return d.activityTimeline
        .filter(a => a.tenantId === tenantId && a.performedBy === userId)
        .sort((a, b) => (b.performedAt || '').localeCompare(a.performedAt || ''))
        .slice(0, limit);
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store);
}

module.exports = { createActivityTimelineRepository };

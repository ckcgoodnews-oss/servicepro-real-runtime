const { makeId, now } = require('../services/id');

function createAiInsightRepository(store) {
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
      d.aiInsights ||= [];
      let results = d.aiInsights.filter(i => i.tenantId === tenantId);
      if (filters.entity_type) results = results.filter(i => i.entityType === filters.entity_type);
      if (filters.entity_id) results = results.filter(i => i.entityId === filters.entity_id);
      if (filters.insight_type) results = results.filter(i => i.insightType === filters.insight_type);
      if (filters.status) results = results.filter(i => i.status === filters.status);
      if (filters.severity) results = results.filter(i => i.severity === filters.severity);
      // Default: active only
      if (!filters.status) results = results.filter(i => i.status === 'active');
      return results.sort((a, b) => {
        // Critical first, then by confidence desc
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        const sevDiff = (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
        if (sevDiff !== 0) return sevDiff;
        return (b.confidence || 0) - (a.confidence || 0);
      });
    },

    findById(tenantId, id) {
      const d = data();
      d.aiInsights ||= [];
      return d.aiInsights.find(i => i.tenantId === tenantId && i.id === id) || null;
    },

    upsert(tenantId, input) {
      const d = data();
      d.aiInsights ||= [];
      // Replace existing active insight of same type for same entity
      const existingIdx = d.aiInsights.findIndex(i =>
        i.tenantId === tenantId && i.entityType === input.entity_type &&
        i.entityId === input.entity_id && i.insightType === input.insight_type &&
        i.status === 'active'
      );

      const insight = {
        id: existingIdx >= 0 ? d.aiInsights[existingIdx].id : makeId('insight'),
        tenantId,
        entityType: input.entity_type,
        entityId: input.entity_id,
        insightType: input.insight_type,
        title: input.title,
        summary: input.summary || null,
        detail: input.detail || {},
        confidence: input.confidence != null ? parseFloat(input.confidence.toFixed(3)) : null,
        severity: input.severity || 'info',
        status: 'active',
        sourceModel: input.source_model || null,
        sourceContext: input.source_context || {},
        expiresAt: input.expires_at || null,
        actedOnAt: null,
        actedOnBy: null,
        createdAt: existingIdx >= 0 ? d.aiInsights[existingIdx].createdAt : now(),
        updatedAt: now()
      };

      if (existingIdx >= 0) d.aiInsights[existingIdx] = insight;
      else d.aiInsights.push(insight);
      save(d);
      return insight;
    },

    updateStatus(tenantId, id, status, userId = null) {
      const d = data();
      d.aiInsights ||= [];
      const idx = d.aiInsights.findIndex(i => i.tenantId === tenantId && i.id === id);
      if (idx === -1) return null;
      const insight = d.aiInsights[idx];
      insight.status = status;
      if (status === 'acted_on') { insight.actedOnAt = now(); insight.actedOnBy = userId; }
      insight.updatedAt = now();
      save(d);
      return insight;
    },

    // Bulk expire by age
    expireOld(tenantId, olderThanDays = 30) {
      const d = data();
      d.aiInsights ||= [];
      const cutoff = new Date(Date.now() - olderThanDays * 86400000).toISOString();
      let expired = 0;
      for (const insight of d.aiInsights) {
        if (insight.tenantId === tenantId && insight.status === 'active' && insight.createdAt < cutoff) {
          insight.status = 'expired';
          expired++;
        }
      }
      if (expired > 0) save(d);
      return { expired };
    },

    // Summary counts for dashboard
    counts(tenantId) {
      const d = data();
      d.aiInsights ||= [];
      const active = d.aiInsights.filter(i => i.tenantId === tenantId && i.status === 'active');
      const byType = {};
      const bySeverity = { critical: 0, warning: 0, info: 0 };
      for (const i of active) {
        byType[i.insightType] = (byType[i.insightType] || 0) + 1;
        bySeverity[i.severity] = (bySeverity[i.severity] || 0) + 1;
      }
      return { total: active.length, byType, bySeverity };
    }
  };
}

function createPostgresImpl(store) { return createJsonImpl(store); }
module.exports = { createAiInsightRepository };

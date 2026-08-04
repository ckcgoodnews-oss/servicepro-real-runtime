const { makeId, now } = require('../services/id');

function createRecordAssociationRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId, sourceType, sourceId, targetType) {
      const d = data();
      d.recordAssociations ||= [];
      let results = d.recordAssociations.filter(a => a.tenantId === tenantId && a.sourceType === sourceType && a.sourceId === sourceId);
      if (targetType) results = results.filter(a => a.targetType === targetType);
      return results.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    },

    listForEntity(tenantId, entityType, entityId) {
      const d = data();
      d.recordAssociations ||= [];
      return d.recordAssociations.filter(a =>
        a.tenantId === tenantId && (
          (a.sourceType === entityType && a.sourceId === entityId) ||
          (a.targetType === entityType && a.targetId === entityId)
        )
      ).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    },

    create(tenantId, input) {
      const d = data();
      d.recordAssociations ||= [];
      // Check for existing
      const existing = d.recordAssociations.find(a =>
        a.tenantId === tenantId && a.sourceType === input.source_type &&
        a.sourceId === input.source_id && a.targetType === input.target_type &&
        a.targetId === input.target_id && a.associationType === (input.association_type || 'related')
      );
      if (existing) {
        existing.label = input.label || existing.label;
        existing.isPrimary = input.is_primary !== undefined ? !!input.is_primary : existing.isPrimary;
        existing.updatedAt = now();
        save(d);
        return existing;
      }

      const assoc = {
        id: makeId('assoc'),
        tenantId,
        sourceType: input.source_type,
        sourceId: input.source_id,
        targetType: input.target_type,
        targetId: input.target_id,
        associationType: input.association_type || 'related',
        label: input.label || null,
        isPrimary: !!input.is_primary,
        metadata: input.metadata || {},
        createdBy: input.created_by || null,
        createdAt: now(),
        updatedAt: now()
      };
      d.recordAssociations.push(assoc);
      save(d);
      return assoc;
    },

    remove(tenantId, sourceType, sourceId, targetType, targetId, associationType) {
      const d = data();
      d.recordAssociations ||= [];
      const idx = d.recordAssociations.findIndex(a =>
        a.tenantId === tenantId && a.sourceType === sourceType &&
        a.sourceId === sourceId && a.targetType === targetType &&
        a.targetId === targetId && a.associationType === (associationType || 'related')
      );
      if (idx === -1) return null;
      d.recordAssociations.splice(idx, 1);
      save(d);
      return { deleted: true };
    },

    removeById(tenantId, id) {
      const d = data();
      d.recordAssociations ||= [];
      const idx = d.recordAssociations.findIndex(a => a.tenantId === tenantId && a.id === id);
      if (idx === -1) return null;
      d.recordAssociations.splice(idx, 1);
      save(d);
      return { deleted: true };
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store);
}

module.exports = { createRecordAssociationRepository };

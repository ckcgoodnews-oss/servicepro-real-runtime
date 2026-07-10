const { makeId, now } = require('../services/id');
const { defaultWorkflowRules } = require('../services/workflowService');

function createWorkflowRepository(store) {
  if (store.type === 'json') return createJsonWorkflowRepository(store);
  if (store.type === 'postgres') return createPostgresWorkflowRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureWorkflows(data) {
  if (!data.workflowRules) data.workflowRules = [];
  if (!data.workflowEvents) data.workflowEvents = [];
  return data;
}

function createJsonWorkflowRepository(store) {
  return {
    listRules(tenantId) {
      return ensureWorkflows(store.read()).workflowRules.filter(x => x.tenantId === tenantId);
    },
    getActiveRule(tenantId, entityType) {
      const data = ensureWorkflows(store.read());
      let rule = data.workflowRules.find(x => x.tenantId === tenantId && x.entityType === entityType && x.active !== false);
      if (!rule && entityType === 'job') {
        rule = { id: makeId('workflow'), ...defaultWorkflowRules(tenantId) };
        data.workflowRules.push(rule);
        store.write(data);
      }
      return rule || null;
    },
    upsertRule(tenantId, input) {
      const data = ensureWorkflows(store.read());
      const entityType = input.entityType || 'job';
      const idx = data.workflowRules.findIndex(x => x.tenantId === tenantId && x.entityType === entityType);
      const rule = {
        id: idx === -1 ? makeId('workflow') : data.workflowRules[idx].id,
        tenantId,
        entityType,
        name: input.name || 'Workflow Rule',
        active: input.active !== false,
        definition: input.definition || defaultWorkflowRules(tenantId).definition,
        createdAt: idx === -1 ? now() : data.workflowRules[idx].createdAt,
        updatedAt: now()
      };
      if (idx === -1) data.workflowRules.push(rule);
      else data.workflowRules[idx] = rule;
      store.write(data);
      return rule;
    },
    listEvents(tenantId) {
      return ensureWorkflows(store.read()).workflowEvents.filter(x => x.tenantId === tenantId).reverse();
    },
    createEvent(tenantId, input) {
      const data = ensureWorkflows(store.read());
      const event = {
        id: makeId('wfevt'),
        tenantId,
        entityType: input.entityType || 'job',
        entityId: input.entityId || '',
        fromStatus: input.fromStatus || '',
        toStatus: input.toStatus || '',
        actorId: input.actorId || '',
        notes: input.notes || '',
        metadata: input.metadata || {},
        createdAt: now()
      };
      data.workflowEvents.push(event);
      store.write(data);
      return event;
    }
  };
}

function createPostgresWorkflowRepository(store) {
  return {
    async listRules(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", entity_type as "entityType", name,
                active, definition, created_at as "createdAt", updated_at as "updatedAt"
         FROM workflow_rules
         WHERE tenant_id = $1
         ORDER BY entity_type, name`,
        [tenantId]
      );
      return result.rows;
    },
    async getActiveRule(tenantId, entityType) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", entity_type as "entityType", name,
                active, definition, created_at as "createdAt", updated_at as "updatedAt"
         FROM workflow_rules
         WHERE tenant_id = $1 AND entity_type = $2 AND active = true
         LIMIT 1`,
        [tenantId, entityType]
      );
      if (result.rows[0]) return result.rows[0];
      if (entityType === 'job') return this.upsertRule(tenantId, defaultWorkflowRules(tenantId));
      return null;
    },
    async upsertRule(tenantId, input) {
      const entityType = input.entityType || 'job';
      const rule = {
        ...defaultWorkflowRules(tenantId),
        ...input,
        entityType,
        tenantId
      };
      const result = await store.query(
        `INSERT INTO workflow_rules (tenant_id, entity_type, name, active, definition)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         ON CONFLICT (tenant_id, entity_type) DO UPDATE SET
           name = EXCLUDED.name,
           active = EXCLUDED.active,
           definition = EXCLUDED.definition,
           updated_at = now()
         RETURNING id::text, tenant_id as "tenantId", entity_type as "entityType", name,
                   active, definition, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, entityType, rule.name, rule.active !== false, JSON.stringify(rule.definition)]
      );
      return result.rows[0];
    },
    async listEvents(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", entity_type as "entityType", entity_id as "entityId",
                from_status as "fromStatus", to_status as "toStatus", actor_id as "actorId",
                notes, metadata, created_at as "createdAt"
         FROM workflow_events
         WHERE tenant_id = $1
         ORDER BY created_at DESC`,
        [tenantId]
      );
      return result.rows;
    },
    async createEvent(tenantId, input) {
      const result = await store.query(
        `INSERT INTO workflow_events
         (tenant_id, entity_type, entity_id, from_status, to_status, actor_id, notes, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
         RETURNING id::text, tenant_id as "tenantId", entity_type as "entityType", entity_id as "entityId",
                   from_status as "fromStatus", to_status as "toStatus", actor_id as "actorId",
                   notes, metadata, created_at as "createdAt"`,
        [
          tenantId,
          input.entityType || 'job',
          input.entityId || '',
          input.fromStatus || '',
          input.toStatus || '',
          input.actorId || '',
          input.notes || '',
          JSON.stringify(input.metadata || {})
        ]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createWorkflowRepository };

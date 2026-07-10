const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');

function createMessageTemplateRepository(store) {
  if (store.type === 'json') return createJsonMessageTemplateRepository(store);
  if (store.type === 'postgres') return createPostgresMessageTemplateRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureTemplates(data) {
  if (!data.messageTemplates) data.messageTemplates = [];
  return data;
}

function createJsonMessageTemplateRepository(store) {
  return {
    list(tenantId) {
      return ensureTemplates(store.read()).messageTemplates.filter(t => t.tenantId === tenantId && t.active !== false);
    },
    findByKey(tenantId, templateKey) {
      return ensureTemplates(store.read()).messageTemplates.find(t => t.tenantId === tenantId && t.templateKey === templateKey && t.active !== false) || null;
    },
    create(tenantId, input) {
      requireFields(input, ['templateKey', 'name', 'channel', 'body']);
      const data = ensureTemplates(store.read());
      if (data.messageTemplates.some(t => t.tenantId === tenantId && t.templateKey === input.templateKey)) {
        const err = new Error(`Template key already exists: ${input.templateKey}`);
        err.status = 409;
        err.code = 'conflict';
        throw err;
      }
      const template = {
        id: makeId('tmpl'),
        tenantId,
        templateKey: input.templateKey,
        name: input.name,
        channel: input.channel,
        subject: input.subject || '',
        body: input.body,
        active: input.active !== false,
        createdAt: now(),
        updatedAt: now()
      };
      data.messageTemplates.push(template);
      store.write(data);
      return template;
    }
  };
}

function createPostgresMessageTemplateRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", template_key as "templateKey",
    name, channel, subject, body, active, created_at as "createdAt", updated_at as "updatedAt"
    FROM message_templates`;

  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND active = true ORDER BY name`, [tenantId]);
      return result.rows;
    },
    async findByKey(tenantId, templateKey) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND template_key = $2 AND active = true LIMIT 1`, [tenantId, templateKey]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      requireFields(input, ['templateKey', 'name', 'channel', 'body']);
      const result = await store.query(
        `INSERT INTO message_templates (tenant_id, template_key, name, channel, subject, body, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id::text, tenant_id as "tenantId", template_key as "templateKey",
                   name, channel, subject, body, active, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.templateKey, input.name, input.channel, input.subject || '', input.body, input.active !== false]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createMessageTemplateRepository };

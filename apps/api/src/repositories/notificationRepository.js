const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');

function createNotificationRepository(store) {
  if (store.type === 'json') return createJsonNotificationRepository(store);
  if (store.type === 'postgres') return createPostgresNotificationRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureNotifications(data) {
  if (!data.notifications) data.notifications = [];
  return data;
}

function createJsonNotificationRepository(store) {
  return {
    list(tenantId) {
      return ensureNotifications(store.read()).notifications.filter(n => n.tenantId === tenantId);
    },
    pending(tenantId, limit = 25) {
      return ensureNotifications(store.read()).notifications
        .filter(n => n.tenantId === tenantId && n.status === 'queued')
        .slice(0, limit);
    },
    create(tenantId, input) {
      requireFields(input, ['channel', 'toAddress', 'body']);
      const data = ensureNotifications(store.read());
      const notification = {
        id: makeId('ntf'),
        tenantId,
        channel: input.channel,
        toAddress: input.toAddress,
        toName: input.toName || '',
        subject: input.subject || '',
        body: input.body,
        templateKey: input.templateKey || '',
        status: input.status || 'queued',
        errorMessage: '',
        createdAt: now(),
        updatedAt: now(),
        sentAt: ''
      };
      data.notifications.push(notification);
      store.write(data);
      return notification;
    },
    updateStatus(tenantId, id, status, errorMessage = '') {
      const data = ensureNotifications(store.read());
      const idx = data.notifications.findIndex(n => n.tenantId === tenantId && n.id === id);
      if (idx === -1) return null;
      data.notifications[idx].status = status;
      data.notifications[idx].errorMessage = errorMessage;
      data.notifications[idx].updatedAt = now();
      if (status === 'sent') data.notifications[idx].sentAt = now();
      store.write(data);
      return data.notifications[idx];
    }
  };
}

function createPostgresNotificationRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", channel, to_address as "toAddress",
    to_name as "toName", subject, body, template_key as "templateKey", status,
    error_message as "errorMessage", created_at as "createdAt", updated_at as "updatedAt",
    sent_at as "sentAt" FROM notification_queue`;

  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId]);
      return result.rows;
    },
    async pending(tenantId, limit = 25) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND status = 'queued' ORDER BY created_at LIMIT $2`, [tenantId, limit]);
      return result.rows;
    },
    async create(tenantId, input) {
      requireFields(input, ['channel', 'toAddress', 'body']);
      const result = await store.query(
        `INSERT INTO notification_queue (tenant_id, channel, to_address, to_name, subject, body, template_key, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id::text, tenant_id as "tenantId", channel, to_address as "toAddress",
                   to_name as "toName", subject, body, template_key as "templateKey", status,
                   error_message as "errorMessage", created_at as "createdAt", updated_at as "updatedAt",
                   sent_at as "sentAt"`,
        [tenantId, input.channel, input.toAddress, input.toName || '', input.subject || '', input.body, input.templateKey || '', input.status || 'queued']
      );
      return result.rows[0];
    },
    async updateStatus(tenantId, id, status, errorMessage = '') {
      const result = await store.query(
        `UPDATE notification_queue
         SET status = $3, error_message = $4, updated_at = now(), sent_at = CASE WHEN $3 = 'sent' THEN now() ELSE sent_at END
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "TenantId", channel, to_address as "toAddress",
                   to_name as "toName", subject, body, template_key as "templateKey", status,
                   error_message as "errorMessage", created_at as "createdAt", updated_at as "updatedAt",
                   sent_at as "sentAt"`,
        [tenantId, id, status, errorMessage]
      );
      return result.rows[0] || null;
    }
  };
}

module.exports = { createNotificationRepository };

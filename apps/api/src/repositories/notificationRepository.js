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
    list(tenantId, filters = {}) {
      return ensureNotifications(store.read()).notifications
        .filter(n => n.tenantId === tenantId)
        .filter(n => !filters.toAddress || String(n.toAddress).toLowerCase() === String(filters.toAddress).toLowerCase())
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
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
        ,readAt: ''
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
    },
    markRead(tenantId, id, toAddress) {
      const data = ensureNotifications(store.read());
      const row = data.notifications.find(n => n.tenantId === tenantId && n.id === id && (!toAddress || String(n.toAddress).toLowerCase() === String(toAddress).toLowerCase()));
      if (!row) return null; row.readAt = row.readAt || now(); row.updatedAt = now(); store.write(data); return row;
    },
    markAllRead(tenantId, toAddress) {
      const data = ensureNotifications(store.read()); const stamp = now(); let count = 0;
      for (const row of data.notifications) if (row.tenantId === tenantId && String(row.toAddress).toLowerCase() === String(toAddress).toLowerCase() && !row.readAt) { row.readAt = stamp; row.updatedAt = stamp; count += 1; }
      if (count) store.write(data); return count;
    }
  };
}

function createPostgresNotificationRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", channel, to_address as "toAddress",
    to_name as "toName", subject, body, template_key as "templateKey", status,
    error_message as "errorMessage", created_at as "createdAt", updated_at as "updatedAt",
    sent_at as "sentAt", read_at as "readAt" FROM notification_queue`;

  return {
    async list(tenantId, filters = {}) {
      const params = [tenantId]; let where = 'WHERE tenant_id = $1';
      if (filters.toAddress) { params.push(filters.toAddress); where += ` AND lower(to_address) = lower($${params.length})`; }
      const result = await store.query(`${selectSql} ${where} ORDER BY created_at DESC`, params);
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
                   sent_at as "sentAt", read_at as "readAt"`,
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
                   sent_at as "sentAt", read_at as "readAt"`,
        [tenantId, id, status, errorMessage]
      );
      return result.rows[0] || null;
    },
    async markRead(tenantId, id, toAddress) {
      const updated = await store.query(`UPDATE notification_queue SET read_at=COALESCE(read_at,now()),updated_at=now() WHERE tenant_id=$1 AND id=$2 AND lower(to_address)=lower($3) RETURNING id::text,tenant_id as "tenantId",channel,to_address as "toAddress",to_name as "toName",subject,body,template_key as "templateKey",status,error_message as "errorMessage",created_at as "createdAt",updated_at as "updatedAt",sent_at as "sentAt",read_at as "readAt"`, [tenantId,id,toAddress]);
      return updated.rows[0] || null;
    },
    async markAllRead(tenantId, toAddress) {
      const result = await store.query(`UPDATE notification_queue SET read_at=now(),updated_at=now() WHERE tenant_id=$1 AND lower(to_address)=lower($2) AND read_at IS NULL`, [tenantId,toAddress]); return result.rowCount;
    }
  };
}

module.exports = { createNotificationRepository };

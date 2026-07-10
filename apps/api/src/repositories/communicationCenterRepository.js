const { makeId, now } = require('../services/id');
const {
  normalizeThreadInput,
  normalizeMessageInput,
  applyMessageToThread,
  assignThread,
  markThreadRead,
  resolveThread,
  summarizeThreads
} = require('../services/communicationCenterService');

function createCommunicationCenterRepository(store) {
  if (store.type === 'json') return createJsonCommunicationCenterRepository(store);
  if (store.type === 'postgres') return createPostgresCommunicationCenterRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureCommunicationCenter(data) {
  if (!data.communicationThreads) data.communicationThreads = [];
  if (!data.communicationMessages) data.communicationMessages = [];
  return data;
}

function createJsonCommunicationCenterRepository(store) {
  return {
    listThreads(tenantId, filters = {}) {
      return ensureCommunicationCenter(store.read()).communicationThreads
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.customerId || x.customerId === filters.customerId)
        .filter(x => !filters.jobId || x.jobId === filters.jobId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.assignedTo || x.assignedTo === filters.assignedTo)
        .filter(x => !filters.channel || x.channel === filters.channel)
        .sort((a, b) => String(b.lastMessageAt || b.createdAt).localeCompare(String(a.lastMessageAt || a.createdAt)));
    },
    findThreadById(tenantId, id) {
      return ensureCommunicationCenter(store.read()).communicationThreads.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    createThread(tenantId, input) {
      const data = ensureCommunicationCenter(store.read());
      const thread = { id: makeId('cthread'), tenantId, ...normalizeThreadInput(input), createdAt: now(), updatedAt: now() };
      data.communicationThreads.push(thread);
      store.write(data);
      return thread;
    },
    updateThread(tenantId, id, input) {
      const data = ensureCommunicationCenter(store.read());
      const idx = data.communicationThreads.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.communicationThreads[idx] = { ...data.communicationThreads[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.communicationThreads[idx];
    },
    listMessages(tenantId, threadId) {
      return ensureCommunicationCenter(store.read()).communicationMessages
        .filter(x => x.tenantId === tenantId && x.threadId === threadId)
        .sort((a, b) => String(a.receivedAt || a.sentAt || a.createdAt).localeCompare(String(b.receivedAt || b.sentAt || b.createdAt)));
    },
    createMessage(tenantId, input) {
      const data = ensureCommunicationCenter(store.read());
      const threadIdx = data.communicationThreads.findIndex(x => x.tenantId === tenantId && x.id === input.threadId);
      if (threadIdx === -1) return null;
      const message = { id: makeId('cmsg'), tenantId, ...normalizeMessageInput(input), createdAt: now(), updatedAt: now() };
      data.communicationMessages.push(message);
      data.communicationThreads[threadIdx] = applyMessageToThread(data.communicationThreads[threadIdx], message);
      store.write(data);
      return message;
    },
    assignThread(tenantId, id, assignedTo) {
      const data = ensureCommunicationCenter(store.read());
      const idx = data.communicationThreads.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.communicationThreads[idx] = assignThread(data.communicationThreads[idx], assignedTo);
      store.write(data);
      return data.communicationThreads[idx];
    },
    markRead(tenantId, id) {
      const data = ensureCommunicationCenter(store.read());
      const idx = data.communicationThreads.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.communicationThreads[idx] = markThreadRead(data.communicationThreads[idx]);
      store.write(data);
      return data.communicationThreads[idx];
    },
    resolveThread(tenantId, id) {
      const data = ensureCommunicationCenter(store.read());
      const idx = data.communicationThreads.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.communicationThreads[idx] = resolveThread(data.communicationThreads[idx]);
      store.write(data);
      return data.communicationThreads[idx];
    },
    summary(tenantId, filters = {}) {
      return summarizeThreads(this.listThreads(tenantId, filters));
    }
  };
}

function createPostgresCommunicationCenterRepository(store) {
  const threadSelect = `SELECT id::text, tenant_id as "tenantId", subject, channel, status, priority,
    customer_id::text as "customerId", job_id::text as "jobId", invoice_id::text as "invoiceId",
    estimate_id::text as "estimateId", assigned_to as "assignedTo", last_message_at as "lastMessageAt",
    unread_count as "unreadCount", needs_response as "needsResponse", response_due_at as "responseDueAt",
    participants, tags, metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM communication_threads`;

  const messageSelect = `SELECT id::text, tenant_id as "tenantId", thread_id::text as "threadId",
    channel, direction, status, from_name as "fromName", from_address as "fromAddress",
    recipients_to as "to", recipients_cc as "cc", recipients_bcc as "bcc", subject, body,
    external_message_id as "externalMessageId", sent_at as "sentAt", received_at as "receivedAt",
    read_at as "readAt", failed_reason as "failedReason", attachment_ids as "attachmentIds",
    metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM communication_messages`;

  return {
    async listThreads(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = {
        customerId: 'customer_id',
        jobId: 'job_id',
        status: 'status',
        assignedTo: 'assigned_to',
        channel: 'channel'
      };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${threadSelect} ${where} ORDER BY COALESCE(last_message_at, created_at) DESC`, params);
      return result.rows;
    },
    async findThreadById(tenantId, id) {
      const result = await store.query(`${threadSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createThread(tenantId, input) {
      const x = normalizeThreadInput(input);
      const result = await store.query(
        `INSERT INTO communication_threads
         (tenant_id, subject, channel, status, priority, customer_id, job_id, invoice_id, estimate_id,
          assigned_to, last_message_at, unread_count, needs_response, response_due_at, participants, tags, metadata)
         VALUES ($1,$2,$3,$4,$5,NULLIF($6,'')::uuid,NULLIF($7,'')::uuid,NULLIF($8,'')::uuid,NULLIF($9,'')::uuid,
                 $10,NULLIF($11,'')::timestamptz,$12,$13,NULLIF($14,'')::timestamptz,$15::jsonb,$16::jsonb,$17::jsonb)
         RETURNING id::text, tenant_id as "tenantId", subject, channel, status, priority,
                   customer_id::text as "customerId", job_id::text as "jobId", invoice_id::text as "invoiceId",
                   estimate_id::text as "estimateId", assigned_to as "assignedTo", last_message_at as "lastMessageAt",
                   unread_count as "unreadCount", needs_response as "needsResponse", response_due_at as "responseDueAt",
                   participants, tags, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.subject, x.channel, x.status, x.priority, x.customerId, x.jobId, x.invoiceId, x.estimateId,
          x.assignedTo, x.lastMessageAt, x.unreadCount, x.needsResponse, x.responseDueAt,
          JSON.stringify(x.participants || []), JSON.stringify(x.tags || []), JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async updateThread(tenantId, id, input) {
      const existing = await this.findThreadById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input };
      const result = await store.query(
        `UPDATE communication_threads
         SET status=$3, priority=$4, assigned_to=$5, unread_count=$6, needs_response=$7,
             response_due_at=NULLIF($8,'')::timestamptz, tags=$9::jsonb, metadata=$10::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", subject, channel, status, priority,
                   customer_id::text as "customerId", job_id::text as "jobId", invoice_id::text as "invoiceId",
                   estimate_id::text as "estimateId", assigned_to as "assignedTo", last_message_at as "lastMessageAt",
                   unread_count as "unreadCount", needs_response as "needsResponse", response_due_at as "responseDueAt",
                   participants, tags, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.status, x.priority, x.assignedTo || '', Number(x.unreadCount || 0), x.needsResponse === true,
          x.responseDueAt || '', JSON.stringify(x.tags || []), JSON.stringify(x.metadata || {})]
      );
      return result.rows[0] || null;
    },
    async listMessages(tenantId, threadId) {
      const result = await store.query(`${messageSelect} WHERE tenant_id = $1 AND thread_id = $2 ORDER BY COALESCE(received_at, sent_at, created_at)`, [tenantId, threadId]);
      return result.rows;
    },
    async createMessage(tenantId, input) {
      const thread = await this.findThreadById(tenantId, input.threadId);
      if (!thread) return null;
      const x = normalizeMessageInput(input);
      const result = await store.query(
        `INSERT INTO communication_messages
         (tenant_id, thread_id, channel, direction, status, from_name, from_address, recipients_to,
          recipients_cc, recipients_bcc, subject, body, external_message_id, sent_at, received_at,
          read_at, failed_reason, attachment_ids, metadata)
         VALUES ($1,$2::uuid,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11,$12,$13,
                 NULLIF($14,'')::timestamptz,NULLIF($15,'')::timestamptz,NULLIF($16,'')::timestamptz,$17,$18::jsonb,$19::jsonb)
         RETURNING id::text, tenant_id as "tenantId", thread_id::text as "threadId",
                   channel, direction, status, from_name as "fromName", from_address as "fromAddress",
                   recipients_to as "to", recipients_cc as "cc", recipients_bcc as "bcc", subject, body,
                   external_message_id as "externalMessageId", sent_at as "sentAt", received_at as "receivedAt",
                   read_at as "readAt", failed_reason as "failedReason", attachment_ids as "attachmentIds",
                   metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.threadId, x.channel, x.direction, x.status, x.fromName, x.fromAddress,
          JSON.stringify(x.to || []), JSON.stringify(x.cc || []), JSON.stringify(x.bcc || []), x.subject, x.body,
          x.externalMessageId, x.sentAt, x.receivedAt, x.readAt, x.failedReason,
          JSON.stringify(x.attachmentIds || []), JSON.stringify(x.metadata || {})]
      );
      const message = result.rows[0];
      const nextThread = applyMessageToThread(thread, message);
      await this.updateThread(tenantId, thread.id, nextThread);
      return message;
    },
    async assignThread(tenantId, id, assignedTo) {
      const thread = await this.findThreadById(tenantId, id);
      if (!thread) return null;
      return this.updateThread(tenantId, id, assignThread(thread, assignedTo));
    },
    async markRead(tenantId, id) {
      const thread = await this.findThreadById(tenantId, id);
      if (!thread) return null;
      return this.updateThread(tenantId, id, markThreadRead(thread));
    },
    async resolveThread(tenantId, id) {
      const thread = await this.findThreadById(tenantId, id);
      if (!thread) return null;
      return this.updateThread(tenantId, id, resolveThread(thread));
    },
    async summary(tenantId, filters = {}) {
      const rows = await this.listThreads(tenantId, filters);
      return summarizeThreads(rows);
    }
  };
}

module.exports = { createCommunicationCenterRepository };

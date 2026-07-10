const { validationError } = require('../errors/domainError');

const COMMUNICATION_CHANNELS = ['email', 'sms', 'phone', 'portal', 'internal'];
const THREAD_STATUSES = ['open', 'pending_customer', 'pending_internal', 'resolved', 'archived'];
const THREAD_PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const MESSAGE_DIRECTIONS = ['inbound', 'outbound', 'internal'];
const MESSAGE_STATUSES = ['draft', 'queued', 'sent', 'delivered', 'failed', 'received', 'read'];

function assertEnum(value, allowed, field) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${field}: ${value}`);
}

function normalizeParticipants(input = []) {
  if (!Array.isArray(input)) return [];
  return input.map(participant => ({
    type: participant.type || 'contact',
    id: participant.id || '',
    displayName: participant.displayName || participant.name || '',
    email: participant.email || '',
    phone: participant.phone || '',
    role: participant.role || ''
  }));
}

function normalizeThreadInput(input = {}) {
  if (!input.subject) throw validationError('subject is required');

  const channel = input.channel || 'email';
  const status = input.status || 'open';
  const priority = input.priority || 'normal';

  assertEnum(channel, COMMUNICATION_CHANNELS, 'communication channel');
  assertEnum(status, THREAD_STATUSES, 'thread status');
  assertEnum(priority, THREAD_PRIORITIES, 'thread priority');

  return {
    subject: input.subject,
    channel,
    status,
    priority,
    customerId: input.customerId || '',
    jobId: input.jobId || '',
    invoiceId: input.invoiceId || '',
    estimateId: input.estimateId || '',
    assignedTo: input.assignedTo || '',
    lastMessageAt: input.lastMessageAt || '',
    unreadCount: Number(input.unreadCount || 0),
    needsResponse: input.needsResponse === true,
    responseDueAt: input.responseDueAt || '',
    participants: normalizeParticipants(input.participants || []),
    tags: Array.isArray(input.tags) ? input.tags : [],
    metadata: input.metadata || {}
  };
}

function normalizeMessageInput(input = {}) {
  if (!input.threadId) throw validationError('threadId is required');
  if (!input.body) throw validationError('body is required');

  const channel = input.channel || 'email';
  const direction = input.direction || 'outbound';
  const status = input.status || (direction === 'inbound' ? 'received' : 'queued');

  assertEnum(channel, COMMUNICATION_CHANNELS, 'message channel');
  assertEnum(direction, MESSAGE_DIRECTIONS, 'message direction');
  assertEnum(status, MESSAGE_STATUSES, 'message status');

  return {
    threadId: input.threadId,
    channel,
    direction,
    status,
    fromName: input.fromName || '',
    fromAddress: input.fromAddress || '',
    to: Array.isArray(input.to) ? input.to : [],
    cc: Array.isArray(input.cc) ? input.cc : [],
    bcc: Array.isArray(input.bcc) ? input.bcc : [],
    subject: input.subject || '',
    body: input.body,
    externalMessageId: input.externalMessageId || '',
    sentAt: input.sentAt || '',
    receivedAt: input.receivedAt || '',
    readAt: input.readAt || '',
    failedReason: input.failedReason || '',
    attachmentIds: Array.isArray(input.attachmentIds) ? input.attachmentIds : [],
    metadata: input.metadata || {}
  };
}

function applyMessageToThread(thread, message, at = new Date().toISOString()) {
  const next = { ...thread };
  next.lastMessageAt = message.sentAt || message.receivedAt || at;

  if (message.direction === 'inbound') {
    next.unreadCount = Number(next.unreadCount || 0) + 1;
    next.needsResponse = true;
    next.status = next.status === 'resolved' || next.status === 'archived' ? 'open' : next.status;
  }

  if (message.direction === 'outbound') {
    next.needsResponse = false;
    if (next.status === 'open') next.status = 'pending_customer';
  }

  if (message.direction === 'internal' && next.status === 'open') {
    next.status = 'pending_internal';
  }

  next.updatedAt = at;
  return next;
}

function assignThread(thread, assignedTo, at = new Date().toISOString()) {
  if (!assignedTo) throw validationError('assignedTo is required');
  return {
    ...thread,
    assignedTo,
    updatedAt: at
  };
}

function markThreadRead(thread, at = new Date().toISOString()) {
  return {
    ...thread,
    unreadCount: 0,
    needsResponse: false,
    updatedAt: at
  };
}

function resolveThread(thread, at = new Date().toISOString()) {
  return {
    ...thread,
    status: 'resolved',
    unreadCount: 0,
    needsResponse: false,
    updatedAt: at
  };
}

function summarizeThreads(threads = []) {
  return {
    threadCount: threads.length,
    openCount: threads.filter(x => x.status === 'open').length,
    pendingCustomerCount: threads.filter(x => x.status === 'pending_customer').length,
    pendingInternalCount: threads.filter(x => x.status === 'pending_internal').length,
    unresolvedCount: threads.filter(x => !['resolved', 'archived'].includes(x.status)).length,
    unreadCount: threads.reduce((sum, x) => sum + Number(x.unreadCount || 0), 0),
    needsResponseCount: threads.filter(x => x.needsResponse).length,
    urgentCount: threads.filter(x => x.priority === 'urgent').length
  };
}

module.exports = {
  COMMUNICATION_CHANNELS,
  THREAD_STATUSES,
  THREAD_PRIORITIES,
  MESSAGE_DIRECTIONS,
  MESSAGE_STATUSES,
  normalizeParticipants,
  normalizeThreadInput,
  normalizeMessageInput,
  applyMessageToThread,
  assignThread,
  markThreadRead,
  resolveThread,
  summarizeThreads
};

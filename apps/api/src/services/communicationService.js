const { validationError } = require('../errors/domainError');

const CHANNELS = ['email', 'sms', 'phone', 'portal', 'internal_note', 'letter'];
const DIRECTIONS = ['inbound', 'outbound', 'internal'];
const STATUSES = ['draft', 'queued', 'sent', 'delivered', 'failed', 'received', 'logged'];

function normalizeCommunicationInput(input = {}) {
  if (!input.customerId) throw validationError('customerId is required');
  if (!input.subject && !input.body) throw validationError('subject or body is required');

  const channel = input.channel || 'internal_note';
  const direction = input.direction || (channel === 'internal_note' ? 'internal' : 'outbound');
  const status = input.status || (direction === 'internal' ? 'logged' : 'sent');

  if (!CHANNELS.includes(channel)) throw validationError(`Unsupported communication channel: ${channel}`);
  if (!DIRECTIONS.includes(direction)) throw validationError(`Unsupported communication direction: ${direction}`);
  if (!STATUSES.includes(status)) throw validationError(`Unsupported communication status: ${status}`);

  return {
    customerId: input.customerId,
    jobId: input.jobId || '',
    estimateId: input.estimateId || '',
    invoiceId: input.invoiceId || '',
    paymentId: input.paymentId || '',
    agreementId: input.agreementId || '',
    channel,
    direction,
    status,
    subject: input.subject || '',
    body: input.body || '',
    fromAddress: input.fromAddress || '',
    toAddress: input.toAddress || '',
    ccAddress: input.ccAddress || '',
    bccAddress: input.bccAddress || '',
    externalMessageId: input.externalMessageId || '',
    templateKey: input.templateKey || '',
    sentAt: input.sentAt || '',
    deliveredAt: input.deliveredAt || '',
    failedAt: input.failedAt || '',
    failureReason: input.failureReason || '',
    tags: Array.isArray(input.tags) ? input.tags : [],
    metadata: input.metadata || {},
    createdBy: input.createdBy || ''
  };
}

function summarizeCommunication(event = {}) {
  const body = String(event.body || '');
  return {
    id: event.id,
    customerId: event.customerId,
    jobId: event.jobId || '',
    channel: event.channel,
    direction: event.direction,
    status: event.status,
    subject: event.subject || '',
    preview: body.length > 140 ? `${body.slice(0, 137)}...` : body,
    createdAt: event.createdAt,
    sentAt: event.sentAt || ''
  };
}

function communicationTimelineSort(events = []) {
  return [...events].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

module.exports = {
  CHANNELS,
  DIRECTIONS,
  STATUSES,
  normalizeCommunicationInput,
  summarizeCommunication,
  communicationTimelineSort
};

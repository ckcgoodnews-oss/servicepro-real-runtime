'use strict';

const crypto = require('node:crypto');

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function buildAuditRecord({
  actor,
  action,
  resourceType,
  resourceId,
  outcome,
  details = {},
  occurredAt = new Date().toISOString(),
}) {
  const payload = {
    schemaVersion: 1,
    sprint: 766,
    control: 'enterprise-release-command-center',
    actor,
    action,
    resourceType,
    resourceId,
    outcome,
    details,
    occurredAt,
  };

  return {
    ...payload,
    auditHash: sha256(JSON.stringify(payload)),
  };
}

function filterAuditRecords(records, filters = {}) {
  return records.filter((record) => {
    if (filters.actor && record.actor !== filters.actor) {
      return false;
    }

    if (filters.action && record.action !== filters.action) {
      return false;
    }

    if (
      filters.resourceType &&
      record.resourceType !== filters.resourceType
    ) {
      return false;
    }

    if (filters.outcome && record.outcome !== filters.outcome) {
      return false;
    }

    if (
      filters.from &&
      Date.parse(record.occurredAt) < Date.parse(filters.from)
    ) {
      return false;
    }

    if (
      filters.to &&
      Date.parse(record.occurredAt) > Date.parse(filters.to)
    ) {
      return false;
    }

    return true;
  });
}

module.exports = {
  buildAuditRecord,
  filterAuditRecords,
  sha256,
};

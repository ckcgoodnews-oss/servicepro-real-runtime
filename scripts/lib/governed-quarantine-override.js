'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const OVERRIDE_STATES = Object.freeze({
  NOT_REQUIRED: 'not_required',
  DENIED: 'denied',
  APPROVED: 'approved',
  EXPIRED: 'expired',
  INVALID: 'invalid',
});

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function readJson(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    return null;
  }
}

function normalizeApprovals(approvals) {
  if (!Array.isArray(approvals)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];

  for (const approval of approvals) {
    if (!approval || typeof approval !== 'object') {
      continue;
    }

    const approver = String(approval.approver || '').trim().toLowerCase();
    const role = String(approval.role || '').trim().toLowerCase();
    const approvedAt = String(approval.approvedAt || '').trim();

    if (!approver || !role || !approvedAt || seen.has(approver)) {
      continue;
    }

    seen.add(approver);
    normalized.push({
      approver,
      role,
      approvedAt,
    });
  }

  return normalized;
}

function validateOverride({
  quarantineRecord,
  overrideRequest,
  now = new Date(),
  requiredApprovals = 2,
}) {
  if (!quarantineRecord || quarantineRecord.quarantined !== true) {
    return {
      state: OVERRIDE_STATES.NOT_REQUIRED,
      authorized: true,
      reasons: [],
      approvals: [],
    };
  }

  if (!overrideRequest || typeof overrideRequest !== 'object') {
    return {
      state: OVERRIDE_STATES.DENIED,
      authorized: false,
      reasons: ['override_request_missing'],
      approvals: [],
    };
  }

  const reasons = [];
  const approvals = normalizeApprovals(overrideRequest.approvals);
  const expiresAt = new Date(overrideRequest.expiresAt || 0);
  const requestedQuarantineId =
    String(overrideRequest.quarantineId || '').trim();
  const changeTicket = String(overrideRequest.changeTicket || '').trim();
  const justification = String(overrideRequest.justification || '').trim();

  if (!requestedQuarantineId) {
    reasons.push('quarantine_id_missing');
  } else if (requestedQuarantineId !== quarantineRecord.quarantineId) {
    reasons.push('quarantine_id_mismatch');
  }

  if (!changeTicket) {
    reasons.push('change_ticket_missing');
  }

  if (justification.length < 20) {
    reasons.push('justification_too_short');
  }

  if (Number.isNaN(expiresAt.getTime())) {
    reasons.push('expiry_invalid');
  } else if (expiresAt <= now) {
    return {
      state: OVERRIDE_STATES.EXPIRED,
      authorized: false,
      reasons: ['override_expired'],
      approvals,
    };
  }

  if (approvals.length < requiredApprovals) {
    reasons.push('insufficient_distinct_approvals');
  }

  const roles = new Set(approvals.map((approval) => approval.role));
  if (!roles.has('release-manager')) {
    reasons.push('release_manager_approval_missing');
  }

  if (!roles.has('security') && !roles.has('sre')) {
    reasons.push('security_or_sre_approval_missing');
  }

  if (reasons.length > 0) {
    return {
      state: OVERRIDE_STATES.INVALID,
      authorized: false,
      reasons,
      approvals,
    };
  }

  return {
    state: OVERRIDE_STATES.APPROVED,
    authorized: true,
    reasons: [],
    approvals,
  };
}

function buildAuthorizationRecord({
  quarantineRecord,
  overrideRequest,
  validation,
  evaluatedAt = new Date().toISOString(),
}) {
  const authorizationId = sha256(JSON.stringify({
    quarantineId:
      quarantineRecord ? quarantineRecord.quarantineId || null : null,
    changeTicket:
      overrideRequest ? overrideRequest.changeTicket || null : null,
    approvals: validation.approvals || [],
    expiresAt:
      overrideRequest ? overrideRequest.expiresAt || null : null,
    state: validation.state,
  }));

  return {
    schemaVersion: 1,
    sprint: 761,
    control: 'governed-quarantine-override',
    evaluatedAt,
    authorizationId,
    state: validation.state,
    authorized: validation.authorized,
    reasons: validation.reasons,
    quarantineId:
      quarantineRecord ? quarantineRecord.quarantineId || null : null,
    changeTicket:
      overrideRequest ? overrideRequest.changeTicket || null : null,
    justification:
      overrideRequest ? overrideRequest.justification || null : null,
    expiresAt:
      overrideRequest ? overrideRequest.expiresAt || null : null,
    approvals: validation.approvals,
    enforcement: {
      allowDeployment: validation.authorized,
      allowPromotion: validation.authorized,
      allowTrafficShift: validation.authorized,
      requireAuditRetention: true,
    },
  };
}

function evaluateOverride({
  rootDir,
  env = process.env,
  now = new Date(),
} = {}) {
  if (!rootDir) {
    throw new Error('rootDir is required');
  }

  const quarantinePath = path.resolve(
    rootDir,
    env.RELEASE_QUARANTINE_REPORT_PATH ||
      path.join(
        'release-evidence',
        'release-integrity-quarantine-report.json',
      ),
  );

  const requestPath = path.resolve(
    rootDir,
    env.RELEASE_OVERRIDE_REQUEST_PATH ||
      path.join(
        'release-evidence',
        'release-quarantine-override-request.json',
      ),
  );

  const outputPath = path.resolve(
    rootDir,
    env.RELEASE_OVERRIDE_REPORT_PATH ||
      path.join(
        'release-evidence',
        'release-quarantine-override-authorization.json',
      ),
  );

  const quarantineRecord = readJson(quarantinePath);
  const overrideRequest = readJson(requestPath);
  const validation = validateOverride({
    quarantineRecord,
    overrideRequest,
    now,
  });

  const record = buildAuthorizationRecord({
    quarantineRecord,
    overrideRequest,
    validation,
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(record, null, 2)}\n`,
    'utf8',
  );

  return {
    record,
    quarantinePath,
    requestPath,
    outputPath,
  };
}

module.exports = {
  OVERRIDE_STATES,
  buildAuthorizationRecord,
  evaluateOverride,
  normalizeApprovals,
  readJson,
  sha256,
  validateOverride,
};

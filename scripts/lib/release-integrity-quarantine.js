'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const QUARANTINE_STATES = Object.freeze({
  CLEAR: 'clear',
  QUARANTINED: 'quarantined',
  RECOVERED: 'recovered',
});

function digest(value) {
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

function shouldQuarantine(report) {
  if (!report || typeof report !== 'object') {
    return true;
  }

  return (
    report.health === 'critical' ||
    report.releaseIntegrityStatus === 'drifted' ||
    report.failClosed === true
  );
}

function determineQuarantineState({ report, previousState }) {
  const quarantine = shouldQuarantine(report);

  if (quarantine) {
    return QUARANTINE_STATES.QUARANTINED;
  }

  if (
    previousState &&
    previousState.quarantineState === QUARANTINE_STATES.QUARANTINED
  ) {
    return QUARANTINE_STATES.RECOVERED;
  }

  return QUARANTINE_STATES.CLEAR;
}

function buildQuarantineRecord({
  report,
  previousState,
  evaluatedAt = new Date().toISOString(),
}) {
  const quarantineState = determineQuarantineState({
    report,
    previousState,
  });

  const reportIdentity = JSON.stringify({
    health: report && report.health,
    releaseIntegrityStatus: report && report.releaseIntegrityStatus,
    incidentKey:
      report && report.incident ? report.incident.key : null,
    expectedReleaseFingerprint:
      report &&
      report.evidence &&
      report.evidence.expectedReleaseFingerprint,
    actualReleaseFingerprint:
      report &&
      report.evidence &&
      report.evidence.actualReleaseFingerprint,
  });

  const quarantineId = digest(reportIdentity);

  return {
    schemaVersion: 1,
    sprint: 760,
    control: 'release-integrity-quarantine-response',
    evaluatedAt,
    quarantineState,
    quarantined: quarantineState === QUARANTINE_STATES.QUARANTINED,
    recovered: quarantineState === QUARANTINE_STATES.RECOVERED,
    quarantineId,
    reason: {
      health: report ? report.health || null : null,
      releaseIntegrityStatus:
        report ? report.releaseIntegrityStatus || null : null,
      failClosed: report ? report.failClosed === true : true,
      incidentKey:
        report && report.incident ? report.incident.key || null : null,
    },
    response: {
      blockPromotion:
        quarantineState === QUARANTINE_STATES.QUARANTINED,
      blockDeployment:
        quarantineState === QUARANTINE_STATES.QUARANTINED,
      requireOperatorReview:
        quarantineState === QUARANTINE_STATES.QUARANTINED,
      allowTrafficShift:
        quarantineState !== QUARANTINE_STATES.QUARANTINED,
    },
  };
}

function evaluateQuarantine({
  rootDir,
  env = process.env,
} = {}) {
  if (!rootDir) {
    throw new Error('rootDir is required');
  }

  const reportPath = path.resolve(
    rootDir,
    env.RELEASE_INTEGRITY_REPORT_PATH ||
      path.join(
        'release-evidence',
        'continuous-release-integrity-report.json',
      ),
  );

  const statePath = path.resolve(
    rootDir,
    env.RELEASE_QUARANTINE_STATE_PATH ||
      path.join(
        'release-evidence',
        'release-integrity-quarantine-state.json',
      ),
  );

  const evidencePath = path.resolve(
    rootDir,
    env.RELEASE_QUARANTINE_REPORT_PATH ||
      path.join(
        'release-evidence',
        'release-integrity-quarantine-report.json',
      ),
  );

  const report = readJson(reportPath);
  const previousState = readJson(statePath);
  const record = buildQuarantineRecord({
    report,
    previousState,
  });

  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(
    evidencePath,
    `${JSON.stringify(record, null, 2)}\n`,
    'utf8',
  );

  const nextState = {
    schemaVersion: 1,
    updatedAt: record.evaluatedAt,
    quarantineState: record.quarantineState,
    quarantineId: record.quarantineId,
    evidencePath,
  };

  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(
    statePath,
    `${JSON.stringify(nextState, null, 2)}\n`,
    'utf8',
  );

  return {
    record,
    reportPath,
    evidencePath,
    statePath,
  };
}

module.exports = {
  QUARANTINE_STATES,
  buildQuarantineRecord,
  determineQuarantineState,
  digest,
  evaluateQuarantine,
  readJson,
  shouldQuarantine,
};

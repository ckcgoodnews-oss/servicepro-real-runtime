'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { runDriftDetection } = require('./release-drift-detector');

const HEALTH_STATES = Object.freeze({
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  CRITICAL: 'critical',
  RECOVERED: 'recovered',
});

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    return null;
  }
}

function determineHealth({ currentStatus, previousStatus }) {
  if (currentStatus === 'aligned') {
    return previousStatus && previousStatus !== 'aligned'
      ? HEALTH_STATES.RECOVERED
      : HEALTH_STATES.HEALTHY;
  }

  if (currentStatus === 'drifted') {
    return HEALTH_STATES.CRITICAL;
  }

  return HEALTH_STATES.DEGRADED;
}

function buildIncidentKey(report) {
  return sha256(JSON.stringify({
    control: report.control,
    status: report.status,
    mismatches: report.mismatches || [],
    missingExpected: report.missingExpected || [],
    missingActual: report.missingActual || [],
    expectedReleaseFingerprint: report.expectedReleaseFingerprint || null,
    actualReleaseFingerprint: report.actualReleaseFingerprint || null,
  }));
}

function evaluateReleaseIntegrity({
  rootDir = path.resolve(__dirname, '../../..'),
  env = process.env,
} = {}) {
  const statePath = path.resolve(
    rootDir,
    env.RELEASE_INTEGRITY_STATE_PATH ||
      path.join('release-evidence', 'continuous-release-integrity-state.json'),
  );
  const evidencePath = path.resolve(
    rootDir,
    env.RELEASE_INTEGRITY_REPORT_PATH ||
      path.join('release-evidence', 'continuous-release-integrity-report.json'),
  );

  const previous = readJson(statePath);
  const { report: driftReport, outputPath: driftReportPath } =
    runDriftDetection({ rootDir, env });

  const health = determineHealth({
    currentStatus: driftReport.status,
    previousStatus: previous && previous.lastStatus,
  });

  const incidentKey = buildIncidentKey(driftReport);
  const duplicateIncident =
    Boolean(previous) &&
    previous.lastIncidentKey === incidentKey &&
    driftReport.status !== 'aligned';

  const recoveryDetected =
    health === HEALTH_STATES.RECOVERED;

  const evaluatedAt = new Date().toISOString();
  const result = {
    schemaVersion: 1,
    sprint: 759,
    control: 'continuous-release-integrity-monitoring',
    evaluatedAt,
    health,
    releaseIntegrityStatus: driftReport.status,
    aligned: driftReport.aligned,
    failClosed: driftReport.failClosed,
    incident: {
      key: incidentKey,
      shouldOpen: driftReport.status !== 'aligned' && !duplicateIncident,
      suppressedAsDuplicate: duplicateIncident,
      recoveryDetected,
    },
    evidence: {
      driftReportPath,
      mismatchCount: (driftReport.mismatches || []).length,
      missingExpectedCount: (driftReport.missingExpected || []).length,
      missingActualCount: (driftReport.missingActual || []).length,
      expectedReleaseFingerprint:
        driftReport.expectedReleaseFingerprint || null,
      actualReleaseFingerprint:
        driftReport.actualReleaseFingerprint || null,
    },
  };

  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

  const nextState = {
    schemaVersion: 1,
    updatedAt: evaluatedAt,
    lastStatus: driftReport.status,
    lastHealth: health,
    lastIncidentKey:
      driftReport.status === 'aligned' ? null : incidentKey,
    lastReportPath: evidencePath,
  };

  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(nextState, null, 2)}\n`, 'utf8');

  return {
    result,
    statePath,
    evidencePath,
  };
}

module.exports = {
  HEALTH_STATES,
  buildIncidentKey,
  determineHealth,
  evaluateReleaseIntegrity,
};

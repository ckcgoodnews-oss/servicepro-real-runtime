const fs = require('fs');

const required = [
  'apps/api/src/services/controlMonitoringService.js',
  'apps/api/src/repositories/controlMonitoringRepository.js',
  'apps/api/src/routes/controlMonitoring.js',
  'scripts/seed-continuous-control-monitoring.js',
  'packages/database/postgres/119_continuous_control_monitoring.sql',
  'docs/sprint119-continuous-control-monitoring.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 119 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeMonitorInput,
  normalizeSignalInput,
  normalizeSuppressionInput,
  compareValue,
  evaluateMonitor,
  shouldOpenAlert,
  alertFromEvaluation,
  acknowledgeAlert,
  resolveAlert,
  isSuppressed,
  revokeSuppression,
  monitoringMetrics
} = require('../apps/api/src/services/controlMonitoringService');

const monitor = { id: 'monitor1', ...normalizeMonitorInput({ controlId: 'CC6.1', name: 'MFA gaps', monitorType: 'threshold', threshold: 0, operator: 'gt', severity: 'high' }) };
if (monitor.code !== 'MFA-GAPS') process.exit(1);
if (!compareValue(2, 'gt', 0)) process.exit(1);

const signal = normalizeSignalInput({ monitorId: monitor.id, signalName: 'mfa_gap', numericValue: 2 });
const evaluation = evaluateMonitor(monitor, [signal]);
if (evaluation.healthStatus !== 'failing') process.exit(1);
if (!shouldOpenAlert(evaluation)) process.exit(1);

let alert = alertFromEvaluation(monitor, evaluation);
alert = acknowledgeAlert(alert, 'security');
if (alert.status !== 'acknowledged') process.exit(1);
alert = resolveAlert(alert, 'security');
if (alert.status !== 'resolved') process.exit(1);

let suppression = normalizeSuppressionInput({ monitorId: monitor.id, reason: 'maintenance', startsAt: '2026-07-01T00:00:00.000Z', endsAt: '2026-08-01T00:00:00.000Z' });
if (!isSuppressed(monitor.id, [suppression], '2026-07-07T00:00:00.000Z')) process.exit(1);
suppression = revokeSuppression(suppression, 'security');
if (suppression.status !== 'revoked') process.exit(1);

const metrics = monitoringMetrics({ monitors: [monitor], evaluations: [evaluation], alerts: [alert] });
if (metrics.totalMonitors !== 1 || metrics.failingControls !== 1 || metrics.openAlerts !== 0) process.exit(1);

console.log('Sprint 119 continuous control monitoring patch test passed.');

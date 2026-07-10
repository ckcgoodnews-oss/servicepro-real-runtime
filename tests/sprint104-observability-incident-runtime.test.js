const fs = require('fs');

const required = [
  'apps/api/src/services/observabilityService.js',
  'apps/api/src/repositories/observabilityRepository.js',
  'apps/api/src/routes/observability.js',
  'scripts/seed-observability.js',
  'packages/database/postgres/104_observability_incident_runtime.sql',
  'docs/sprint104-observability-incident-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 104 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeServiceMonitorInput,
  normalizeSloInput,
  normalizeAlertEventInput,
  normalizeIncidentInput,
  normalizeIncidentTimelineInput,
  acknowledgeAlert,
  resolveAlert,
  transitionIncident,
  calculateAvailabilityPercent,
  calculateErrorBudget,
  evaluateSlo,
  summarizeIncidents
} = require('../apps/api/src/services/observabilityService');

const monitor = { id: 'mon1', ...normalizeServiceMonitorInput({ name: 'API Health', serviceName: 'api' }) };
if (monitor.monitorType !== 'http' || monitor.status !== 'active') process.exit(1);

const slo = normalizeSloInput({ serviceName: 'api', name: 'Availability', targetPercent: 99.9 });
if (slo.window !== '30d') process.exit(1);

let alert = normalizeAlertEventInput({ monitorId: 'mon1', title: 'Latency high' });
alert = acknowledgeAlert(alert, 'operator');
if (alert.status !== 'acknowledged') process.exit(1);

alert = resolveAlert(alert, 'operator');
if (alert.status !== 'resolved') process.exit(1);

let incident = normalizeIncidentInput({ title: 'API outage', severity: 'sev2', impactedServices: ['api'] });
incident = transitionIncident(incident, 'mitigated', 'commander');
if (incident.status !== 'mitigated' || !incident.mitigatedAt) process.exit(1);

const timeline = normalizeIncidentTimelineInput({ incidentId: 'inc1', eventType: 'note', message: 'Investigating' });
if (timeline.eventType !== 'note') process.exit(1);

if (calculateAvailabilityPercent(999, 1000) !== 99.9) process.exit(1);

const budget = calculateErrorBudget({ targetPercent: 99.9, totalEvents: 100000, badEvents: 50 });
if (budget.exhausted !== false || budget.remainingBadEvents !== 50) process.exit(1);

const evaluated = evaluateSlo({ serviceName: 'api', code: 'API-AVAILABILITY', targetPercent: 99.9 }, [{ totalEvents: 100000, badEvents: 50 }]);
if (evaluated.met !== true || evaluated.availabilityPercent !== 99.95) process.exit(1);

const summary = summarizeIncidents([
  { status: 'open', severity: 'sev1' },
  { status: 'closed', severity: 'sev2' }
]);
if (summary.open !== 1 || summary.resolved !== 1 || summary.sev1 !== 1) process.exit(1);

console.log('Sprint 104 observability incident runtime patch test passed.');

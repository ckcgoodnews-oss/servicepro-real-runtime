const fs = require('fs');

const required = [
  'apps/api/src/services/securityIncidentService.js',
  'apps/api/src/repositories/securityIncidentRepository.js',
  'apps/api/src/routes/securityIncidents.js',
  'scripts/seed-security-incident-response.js',
  'packages/database/postgres/114_security_incident_response.sql',
  'docs/sprint114-security-incident-response.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 114 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeIncidentInput,
  normalizeContainmentTaskInput,
  normalizeEvidenceInput,
  normalizeNotificationInput,
  normalizePostmortemInput,
  classifySeverity,
  transitionIncident,
  completeTask,
  addCustodyEntry,
  sendNotification,
  failNotification,
  approvePostmortem,
  publishPostmortem,
  incidentMetrics
} = require('../apps/api/src/services/securityIncidentService');

let incident = normalizeIncidentInput({ title: 'Data exposure', affectedSystems: ['api'], affectedDataTypes: ['email'], severity: 'critical', incidentType: 'data_exposure' });
if (incident.status !== 'new') process.exit(1);
if (classifySeverity({ externalExposure: true, affectedDataTypes: ['email'] }) !== 'critical') process.exit(1);
if (classifySeverity({ affectedSystems: ['a', 'b', 'c'] }) !== 'high') process.exit(1);

incident = transitionIncident(incident, 'contained');
if (incident.status !== 'contained' || !incident.containedAt) process.exit(1);
incident = transitionIncident(incident, 'resolved');
incident = transitionIncident(incident, 'closed');
if (incident.status !== 'closed' || !incident.closedAt) process.exit(1);

let task = normalizeContainmentTaskInput({ incidentId: 'inc1', title: 'Rotate keys' });
task = completeTask(task);
if (task.status !== 'completed') process.exit(1);

let evidence = normalizeEvidenceInput({ incidentId: 'inc1', title: 'Audit log', evidenceType: 'log' });
evidence = addCustodyEntry(evidence, 'analyst', 'collected');
if (evidence.chainOfCustody.length !== 1) process.exit(1);

let note = normalizeNotificationInput({ incidentId: 'inc1', recipient: 'security@example.com' });
note = sendNotification(note);
if (note.status !== 'sent') process.exit(1);
const failed = failNotification(normalizeNotificationInput({ incidentId: 'inc1', recipient: 'security@example.com' }), 'smtp');
if (failed.status !== 'failed') process.exit(1);

let post = normalizePostmortemInput({ incidentId: 'inc1', summary: 'Done' });
post = approvePostmortem(post, 'director');
if (post.status !== 'approved') process.exit(1);
post = publishPostmortem(post);
if (post.status !== 'published') process.exit(1);

const metrics = incidentMetrics([incident, { ...incident, status: 'new', severity: 'critical' }]);
if (metrics.total !== 2 || metrics.open !== 1 || metrics.critical !== 2 || metrics.unresolved !== 1) process.exit(1);

console.log('Sprint 114 security incident response patch test passed.');

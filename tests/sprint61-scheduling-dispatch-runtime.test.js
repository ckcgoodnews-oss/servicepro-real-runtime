const fs = require('fs');

const required = [
  'apps/api/src/services/scheduleService.js',
  'apps/api/src/repositories/technicianRepository.js',
  'apps/api/src/repositories/appointmentRepository.js',
  'apps/api/src/repositories/dispatchRepository.js',
  'apps/api/src/routes/technicians.js',
  'apps/api/src/routes/appointments.js',
  'apps/api/src/routes/dispatch.js',
  'packages/database/postgres/061_scheduling_dispatch_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 61 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint61.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-61';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { findConflicts } = require('../apps/api/src/services/scheduleService');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const technicians = repos.technicians.list('tenant_demo');
if (!technicians.length) {
  console.error('Technician seed missing.');
  process.exit(1);
}

const appointment = repos.appointments.create('tenant_demo', {
  jobId: 'job_demo_1',
  customerId: 'cust_demo_1',
  technicianId: technicians[0].id,
  startTime: '2026-07-06T14:00:00.000Z',
  endTime: '2026-07-06T15:00:00.000Z'
});

if (!appointment.id) {
  console.error('Appointment create failed.');
  process.exit(1);
}

let conflictDetected = false;
try {
  repos.appointments.create('tenant_demo', {
    jobId: 'job_demo_1',
    customerId: 'cust_demo_1',
    technicianId: technicians[0].id,
    startTime: '2026-07-06T14:30:00.000Z',
    endTime: '2026-07-06T15:30:00.000Z'
  });
} catch (err) {
  conflictDetected = err.code === 'schedule_conflict';
}

if (!conflictDetected) {
  console.error('Expected schedule conflict was not detected.');
  process.exit(1);
}

const assignment = repos.dispatch.assign('tenant_demo', {
  jobId: 'job_demo_1',
  technicianId: technicians[0].id,
  appointmentId: appointment.id
});

if (!assignment.id) {
  console.error('Dispatch assignment failed.');
  process.exit(1);
}

const ownerPermissions = permissionsForRoles(['owner']);
if (!ownerPermissions.includes(PERMISSIONS.SCHEDULE_WRITE) || !ownerPermissions.includes(PERMISSIONS.DISPATCH_WRITE)) {
  console.error('Owner missing scheduling/dispatch permissions.');
  process.exit(1);
}

console.log('Sprint 61 scheduling/dispatch runtime patch test passed.');

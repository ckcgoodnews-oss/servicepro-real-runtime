const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { transitionJob } = require('../apps/api/src/services/workflowService');
const { createAppointmentRepository } = require('../apps/api/src/repositories/appointmentRepository');

assert.strictEqual(transitionJob({ status: 'open' }, 'scheduled').status, 'scheduled');
assert.throws(() => transitionJob({ status: 'open' }, 'completed'), /Invalid workflow transition/);
let state = { appointments: [] }; const store = { type: 'json', read: () => structuredClone(state), write: data => { state = structuredClone(data); } }; const appointments = createAppointmentRepository(store);
const appointment = appointments.create('tenant_a', { jobId: 'job_a', technicianId: 'tech_a', startTime: '2026-07-16T14:00:00.000Z', endTime: '2026-07-16T16:00:00.000Z' });
assert.strictEqual(appointments.list('tenant_a').length, 1);
assert.strictEqual(appointments.list('tenant_b').length, 0);
assert.throws(() => appointments.create('tenant_a', { jobId: 'job_b', technicianId: 'tech_a', startTime: '2026-07-16T15:00:00.000Z', endTime: '2026-07-16T17:00:00.000Z' }), /Schedule conflict/);
assert.strictEqual(appointments.update('tenant_a', appointment.id, { technicianId: 'tech_b' }).technicianId, 'tech_b');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const component = read('apps/web/src/components/WorkOrderWorkspace.tsx');
for (const label of ['Search work orders', "'kanban'", "'calendar'", 'Save assignment', 'Move to']) assert.match(component, new RegExp(label));
assert.match(read('packages/database/postgres/723_work_order_experience.sql'), /idx_jobs_tenant_status_priority/);
console.log('Sprint 723 work order experience test passed.');

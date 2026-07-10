const { readStore, writeStore } = require('../store/jsonStore');
const { makeId, now } = require('./id');
const { requireFields } = require('../utils/validation');

function listJobs(tenantId) {
  return readStore().jobs.filter(j => j.tenantId === tenantId);
}

function getJob(tenantId, id) {
  return readStore().jobs.find(j => j.tenantId === tenantId && j.id === id) || null;
}

function createJob(tenantId, input) {
  requireFields(input, ['title']);

  const data = readStore();
  const job = {
    id: makeId('job'),
    tenantId,
    customerId: input.customerId || '',
    title: input.title,
    status: input.status || 'open',
    priority: input.priority || 'normal',
    createdAt: now(),
    updatedAt: now()
  };

  data.jobs.push(job);
  writeStore(data);
  return job;
}

function updateJob(tenantId, id, input) {
  const data = readStore();
  const idx = data.jobs.findIndex(j => j.tenantId === tenantId && j.id === id);
  if (idx === -1) return null;

  data.jobs[idx] = {
    ...data.jobs[idx],
    ...input,
    id,
    tenantId,
    updatedAt: now()
  };
  writeStore(data);
  return data.jobs[idx];
}

function deleteJob(tenantId, id) {
  const data = readStore();
  const before = data.jobs.length;
  data.jobs = data.jobs.filter(j => !(j.tenantId === tenantId && j.id === id));
  const deleted = data.jobs.length !== before;
  if (deleted) writeStore(data);
  return deleted;
}

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob };

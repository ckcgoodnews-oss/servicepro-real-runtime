const { makeId, now } = require('../services/id');

function createSalesSequenceRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId, filters = {}) {
      const d = data();
      d.salesSequences ||= [];
      let r = d.salesSequences.filter(s => s.tenantId === tenantId);
      if (filters.is_active !== undefined) r = r.filter(s => s.isActive === filters.is_active);
      if (filters.owner_id) r = r.filter(s => s.ownerId === filters.owner_id);
      return r.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },

    findById(tenantId, id) {
      const d = data(); d.salesSequences ||= [];
      return d.salesSequences.find(s => s.tenantId === tenantId && s.id === id) || null;
    },

    create(tenantId, input) {
      const d = data(); d.salesSequences ||= [];
      const seq = {
        id: makeId('seq'), tenantId, name: input.name || '', description: input.description || '',
        steps: input.steps || [],
        settings: input.settings || { daily_send_limit: 50, stop_on_reply: true, stop_on_meeting: true },
        isActive: input.is_active !== false, enrolledCount: 0, completedCount: 0, replyCount: 0,
        ownerId: input.owner_id || null, createdAt: now(), updatedAt: now()
      };
      d.salesSequences.push(seq); save(d); return seq;
    },

    update(tenantId, id, input) {
      const d = data(); d.salesSequences ||= [];
      const idx = d.salesSequences.findIndex(s => s.tenantId === tenantId && s.id === id);
      if (idx === -1) return null;
      const seq = d.salesSequences[idx];
      if (input.name !== undefined) seq.name = input.name;
      if (input.description !== undefined) seq.description = input.description;
      if (input.steps !== undefined) seq.steps = input.steps;
      if (input.settings !== undefined) seq.settings = { ...seq.settings, ...input.settings };
      if (input.is_active !== undefined) seq.isActive = !!input.is_active;
      seq.updatedAt = now(); save(d); return seq;
    },

    delete(tenantId, id) {
      const d = data(); d.salesSequences ||= [];
      const idx = d.salesSequences.findIndex(s => s.tenantId === tenantId && s.id === id);
      if (idx === -1) return null;
      d.salesSequences.splice(idx, 1);
      d.sequenceEnrollments = (d.sequenceEnrollments || []).filter(e => e.sequenceId !== id);
      save(d); return { deleted: true };
    },

    // Enrollments
    enroll(tenantId, sequenceId, contactId) {
      const d = data(); d.sequenceEnrollments ||= [];
      // Don't double-enroll
      const existing = d.sequenceEnrollments.find(e => e.tenantId === tenantId && e.sequenceId === sequenceId && e.contactId === contactId && e.status === 'active');
      if (existing) return existing;
      const enrollment = {
        id: makeId('enroll'), tenantId, sequenceId, contactId,
        currentStep: 0, status: 'active', enrolledAt: now(),
        lastStepAt: null, nextStepAt: now(), completedAt: null, unenrolledReason: null, metadata: {}
      };
      d.sequenceEnrollments.push(enrollment);
      // Increment enrolled count
      const seq = d.salesSequences.find(s => s.id === sequenceId);
      if (seq) seq.enrolledCount++;
      save(d); return enrollment;
    },

    listEnrollments(tenantId, sequenceId, filters = {}) {
      const d = data(); d.sequenceEnrollments ||= [];
      let r = d.sequenceEnrollments.filter(e => e.tenantId === tenantId && e.sequenceId === sequenceId);
      if (filters.status) r = r.filter(e => e.status === filters.status);
      return r;
    },

    unenroll(tenantId, enrollmentId, reason = 'manual') {
      const d = data(); d.sequenceEnrollments ||= [];
      const e = d.sequenceEnrollments.find(x => x.tenantId === tenantId && x.id === enrollmentId);
      if (!e || e.status !== 'active') return null;
      e.status = 'unenrolled'; e.unenrolledReason = reason; e.completedAt = now();
      save(d); return e;
    },

    advanceStep(tenantId, enrollmentId) {
      const d = data(); d.sequenceEnrollments ||= []; d.salesSequences ||= [];
      const e = d.sequenceEnrollments.find(x => x.tenantId === tenantId && x.id === enrollmentId);
      if (!e || e.status !== 'active') return null;
      const seq = d.salesSequences.find(s => s.id === e.sequenceId);
      if (!seq) return null;
      e.currentStep++;
      e.lastStepAt = now();
      if (e.currentStep >= seq.steps.length) {
        e.status = 'completed'; e.completedAt = now();
        seq.completedCount++;
      } else {
        const nextStep = seq.steps[e.currentStep];
        const delayMs = (nextStep?.delay_days || 1) * 86400000;
        e.nextStepAt = new Date(Date.now() + delayMs).toISOString();
      }
      save(d); return e;
    },

    markReplied(tenantId, enrollmentId) {
      const d = data(); d.sequenceEnrollments ||= []; d.salesSequences ||= [];
      const e = d.sequenceEnrollments.find(x => x.tenantId === tenantId && x.id === enrollmentId);
      if (!e || e.status !== 'active') return null;
      e.status = 'replied'; e.completedAt = now();
      const seq = d.salesSequences.find(s => s.id === e.sequenceId);
      if (seq) seq.replyCount++;
      save(d); return e;
    }
  };
}

function createPostgresImpl(store) { return createJsonImpl(store); }
module.exports = { createSalesSequenceRepository };

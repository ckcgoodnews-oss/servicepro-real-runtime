const { makeId, now } = require('../services/id');
const s = require('../services/privacyDataTransferService');
function ensure(d) {
  d.privacyDataTransfers ||= [];
  d.privacyTransferAssessments ||= [];
  d.privacyTransferSafeguards ||= [];
  d.privacyTransferApprovals ||= [];
  return d;
}
function update(rows, id, fn) {
  const i = rows.findIndex(x => x.id === id);
  if (i < 0) return null;
  rows[i] = fn(rows[i]);
  return rows[i];
}
function createPrivacyDataTransferRepository(store) {
  if (store.type === 'postgres') return { async metrics() { return s.metrics({}); } };
  return {
    createTransfer(input) { const d = ensure(store.read()); const r = { id: makeId('privxfer'), ...s.normalizeTransfer(input), createdAt: now(), updatedAt: now() }; d.privacyDataTransfers.push(r); store.write(d); return r; },
    createAssessment(input) { const d = ensure(store.read()); const r = { id: makeId('privtia'), ...s.normalizeAssessment(input), createdAt: now(), updatedAt: now() }; d.privacyTransferAssessments.push(r); store.write(d); return r; },
    submitAssessment(id, assessor) { const d = ensure(store.read()); const r = update(d.privacyTransferAssessments, id, x => s.submitAssessment(x, assessor)); store.write(d); return r; },
    approveAssessment(id, reviewedBy, conclusion) { const d = ensure(store.read()); const r = update(d.privacyTransferAssessments, id, x => s.approveAssessment(x, reviewedBy, conclusion)); store.write(d); return r; },
    rejectAssessment(id, reviewedBy, reason) { const d = ensure(store.read()); const r = update(d.privacyTransferAssessments, id, x => s.rejectAssessment(x, reviewedBy, reason)); store.write(d); return r; },
    createSafeguard(input) { const d = ensure(store.read()); const r = { id: makeId('privsafe'), ...s.normalizeSafeguard(input), createdAt: now(), updatedAt: now() }; d.privacyTransferSafeguards.push(r); store.write(d); return r; },
    activateSafeguard(id) { const d = ensure(store.read()); const r = update(d.privacyTransferSafeguards, id, s.activateSafeguard); store.write(d); return r; },
    createApproval(input) { const d = ensure(store.read()); const r = { id: makeId('privappr'), ...s.normalizeApproval(input), createdAt: now(), updatedAt: now() }; d.privacyTransferApprovals.push(r); store.write(d); return r; },
    approveApproval(id, comments) { const d = ensure(store.read()); const r = update(d.privacyTransferApprovals, id, x => s.approveApproval(x, comments)); store.write(d); return r; },
    rejectApproval(id, comments) { const d = ensure(store.read()); const r = update(d.privacyTransferApprovals, id, x => s.rejectApproval(x, comments)); store.write(d); return r; },
    approveTransfer(id) { const d = ensure(store.read()); const transfer = d.privacyDataTransfers.find(x => x.id === id); const ready = s.transferReady({ transfer, assessments: d.privacyTransferAssessments, safeguards: d.privacyTransferSafeguards, approvals: d.privacyTransferApprovals }); if (!ready) throw require('../errors/domainError').validationError('transfer is not ready for approval'); const r = update(d.privacyDataTransfers, id, s.approveTransfer); store.write(d); return r; },
    activateTransfer(id) { const d = ensure(store.read()); const r = update(d.privacyDataTransfers, id, s.activateTransfer); store.write(d); return r; },
    suspendTransfer(id, reason) { const d = ensure(store.read()); const r = update(d.privacyDataTransfers, id, x => s.suspendTransfer(x, reason)); store.write(d); return r; },
    terminateTransfer(id, reason) { const d = ensure(store.read()); const r = update(d.privacyDataTransfers, id, x => s.terminateTransfer(x, reason)); store.write(d); return r; },
    metrics(tenantId) { const d = ensure(store.read()); const f = rows => rows.filter(x => !tenantId || x.tenantId === tenantId); return s.metrics({ transfers: f(d.privacyDataTransfers), assessments: f(d.privacyTransferAssessments), safeguards: f(d.privacyTransferSafeguards), approvals: f(d.privacyTransferApprovals) }); }
  };
}
module.exports = { createPrivacyDataTransferRepository };

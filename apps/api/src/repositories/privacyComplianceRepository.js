const { makeId, now } = require('../services/id');
const svc = require('../services/privacyComplianceService');
function ensure(d) { d.privacyComplianceEvidence ||= []; d.privacyComplianceReports ||= []; return d; }
function update(rows, id, fn) { const i = rows.findIndex(x => x.id === id); if (i < 0) return null; rows[i] = fn(rows[i]); return rows[i]; }
function createPrivacyComplianceRepository(store) {
  if (store.type === 'postgres') return { async metrics() { return svc.metrics({}); } };
  return {
    createEvidence(input) { const d=ensure(store.read()), r={id:makeId('privevidence'),...svc.normalizeEvidenceInput(input),createdAt:now(),updatedAt:now()}; d.privacyComplianceEvidence.push(r); store.write(d); return r; },
    submitEvidence(id, reviewer) { const d=ensure(store.read()), r=update(d.privacyComplianceEvidence,id,x=>svc.submitEvidence(x,reviewer)); store.write(d); return r; },
    reviewEvidence(id, outcome, note) { const d=ensure(store.read()), r=update(d.privacyComplianceEvidence,id,x=>svc.reviewEvidence(x,outcome,note)); store.write(d); return r; },
    createReport(input) { const d=ensure(store.read()), r={id:makeId('privreport'),...svc.normalizeReportInput(input),createdAt:now(),updatedAt:now()}; d.privacyComplianceReports.push(r); store.write(d); return r; },
    generateReport(id) { const d=ensure(store.read()), r=update(d.privacyComplianceReports,id,x=>svc.generateReport(x,d.privacyComplianceEvidence)); store.write(d); return r; },
    publishReport(id) { const d=ensure(store.read()), r=update(d.privacyComplianceReports,id,svc.publishReport); store.write(d); return r; },
    metrics(tenantId) { const d=ensure(store.read()); return svc.metrics({evidence:d.privacyComplianceEvidence.filter(x=>!tenantId||x.tenantId===tenantId),reports:d.privacyComplianceReports.filter(x=>!tenantId||x.tenantId===tenantId)}); }
  };
}
module.exports = { createPrivacyComplianceRepository };

'use strict';
const crypto = require('node:crypto');
function normalizeStep(step, index) {
  const status = String(step.status || 'pending').toLowerCase();
  return { id: step.id || `step-${index + 1}`, name: step.name || step.id || `Step ${index + 1}`, order: Number.isFinite(step.order) ? step.order : index + 1, required: step.required !== false, status, evidence: step.evidence || null, owner: step.owner || null };
}
function evaluateGeneralAvailabilityCutover({ releaseId, environment='production', window={}, steps=[], approvals=[], readinessCertificate=null, policy={} }) {
  const evaluatedAt = new Date().toISOString();
  const normalized = steps.map(normalizeStep).sort((a,b)=>a.order-b.order);
  const blockingSteps = normalized.filter(s=>s.required && s.status!=='passed');
  const roles = new Set(approvals.filter(a=>a.approved===true).map(a=>String(a.role||'').toLowerCase()));
  const missingApprovals = (policy.requiredApprovalRoles||[]).filter(r=>!roles.has(String(r).toLowerCase()));
  const readinessValid = Boolean(readinessCertificate && readinessCertificate.releaseId===releaseId && readinessCertificate.certifiedAt);
  const now=Date.now(), start=window.start?Date.parse(window.start):NaN, end=window.end?Date.parse(window.end):NaN;
  const windowValid = Number.isFinite(start)&&Number.isFinite(end)&&start<end;
  const withinWindow = windowValid ? now>=start && now<=end : policy.requireActiveWindow!==true;
  const authorized = readinessValid && blockingSteps.length===0 && missingApprovals.length===0 && withinWindow;
  const cutoverId=crypto.createHash('sha256').update(JSON.stringify({releaseId,environment,steps:normalized,approvals,readinessCertificate})).digest('hex').slice(0,24);
  return { schemaVersion:1, phase:71, sprint:773, control:'general-availability-cutover', cutoverId, releaseId, environment, evaluatedAt, authorized, readinessValid, windowValid, withinWindow, blockingSteps, missingApprovals, executionPlan: normalized, rollbackRequired: !authorized, decision: authorized?'authorize-cutover':'block-cutover' };
}
module.exports={normalizeStep,evaluateGeneralAvailabilityCutover};

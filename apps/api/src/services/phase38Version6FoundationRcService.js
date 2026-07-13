const { validationError } = require('../errors/domainError');
const ALLOWED_STATUSES = ['draft','active','blocked','passed','completed','retired','failed'];
const DOMAINS = ["architecture-modernization", "runtime-platform-upgrade", "api-v6-foundation", "data-model-modernization", "frontend-platform-modernization", "identity-platform-modernization", "event-platform-modernization", "observability-platform-upgrade", "security-architecture-upgrade", "migration-tooling-v6", "compatibility-validation-v6", "performance-certification-v6", "release-candidate-operations", "version-6-rc-readiness", "version-6-release-candidate"];
function normalizeRecord(input={}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.domain || !DOMAINS.includes(input.domain)) throw validationError('valid domain is required');
  if (!input.name) throw validationError('name is required');
  if (input.status && !ALLOWED_STATUSES.includes(input.status)) throw validationError('valid status is required');
  return { tenantId: input.tenantId, domain: input.domain, name: input.name, status: input.status || 'draft', owner: input.owner || '', gateRequired: input.gateRequired !== false, evidence: input.evidence || {}, details: input.details || {} };
}
function transitionRecord(row, action, at=new Date().toISOString()) {
  const map={activate:'active',block:'blocked',pass:'passed',complete:'completed',retire:'retired',fail:'failed'};
  if (!map[action]) throw validationError(`Unsupported transition: ${action}`);
  return {...row,status:map[action],updatedAt:at};
}
function releaseReady(rows=[]) {
  const required=rows.filter(x=>x.gateRequired!==false);
  return required.length===DOMAINS.length && required.every(x=>['passed','completed','retired'].includes(x.status));
}
function metrics(rows=[]) {
  return { total: rows.length, active: rows.filter(x=>x.status==='active').length, blocked: rows.filter(x=>x.status==='blocked').length, passed: rows.filter(x=>x.status==='passed').length, completed: rows.filter(x=>x.status==='completed').length, failed: rows.filter(x=>x.status==='failed').length, releaseReady: releaseReady(rows), byDomain: Object.fromEntries(DOMAINS.map(d=>[d,rows.filter(x=>x.domain===d).length])) };
}
module.exports={ALLOWED_STATUSES,DOMAINS,normalizeRecord,transitionRecord,releaseReady,metrics};

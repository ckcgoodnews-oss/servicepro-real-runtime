const { validationError } = require('../errors/domainError');
const ALLOWED_STATUSES = ['draft','active','paused','completed','retired','failed'];
const DOMAINS = ["custom-object-framework", "visual-workflow-designer", "low-code-form-builder", "business-rule-designer", "plugin-runtime-v2", "plugin-lifecycle-management", "marketplace-publishing-workflow", "extension-security-sandbox", "developer-test-harness", "api-schema-registry", "event-schema-registry", "integration-testing-lab", "developer-observability", "extensibility-certification", "platform-extensibility-release"];
function normalizeRecord(input={}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.domain || !DOMAINS.includes(input.domain)) throw validationError('valid domain is required');
  if (!input.name) throw validationError('name is required');
  if (input.status && !ALLOWED_STATUSES.includes(input.status)) throw validationError('valid status is required');
  return { tenantId: input.tenantId, domain: input.domain, name: input.name, status: input.status || 'draft', owner: input.owner || '', details: input.details || {} };
}
function transitionRecord(row, action, at=new Date().toISOString()) {
  const map={activate:'active',pause:'paused',complete:'completed',retire:'retired',fail:'failed'};
  if (!map[action]) throw validationError(`Unsupported transition: ${action}`);
  return {...row,status:map[action],updatedAt:at};
}
function metrics(rows=[]) {
  return { total: rows.length, active: rows.filter(x=>x.status==='active').length, completed: rows.filter(x=>x.status==='completed').length, failed: rows.filter(x=>x.status==='failed').length, byDomain: Object.fromEntries(DOMAINS.map(d=>[d,rows.filter(x=>x.domain===d).length])) };
}
module.exports={ALLOWED_STATUSES,DOMAINS,normalizeRecord,transitionRecord,metrics};

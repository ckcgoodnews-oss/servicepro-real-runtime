const { validationError } = require('../errors/domainError');
const ALLOWED_STATUSES = ['draft','active','paused','completed','retired','failed'];
const DOMAINS = ["industry-solution-framework", "healthcare-service-operations", "manufacturing-maintenance-operations", "government-service-operations", "utilities-field-operations", "transportation-fleet-operations", "property-facilities-operations", "telecommunications-field-operations", "education-campus-operations", "retail-multi-site-operations", "industry-compliance-packs", "industry-workflow-templates", "industry-analytics-packs", "industry-solution-certification", "industry-solutions-release"];
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

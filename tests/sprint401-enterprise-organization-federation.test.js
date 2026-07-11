const svc=require('../apps/api/src/services/phase25EnterpriseFederationEcosystemService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'enterprise-organization-federation',name:'Enterprise Organization Federation'});
if(row.domain!=='enterprise-organization-federation'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['enterprise-organization-federation']!==1)process.exit(1);
console.log('Sprint 401 Enterprise Organization Federation test passed.');

const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'enterprise-sustainability-operations',name:'Enterprise Sustainability Operations'});
if(row.domain!=='enterprise-sustainability-operations'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['enterprise-sustainability-operations']!==1)process.exit(1);
console.log('Sprint 595 Enterprise Sustainability Operations test passed.');

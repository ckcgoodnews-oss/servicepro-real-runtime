const svc=require('../apps/api/src/services/phase24FinancialGrowthOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'renewal-and-expansion-management',name:'Renewal and Expansion Management'});
if(row.domain!=='renewal-and-expansion-management'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['renewal-and-expansion-management']!==1)process.exit(1);
console.log('Sprint 396 Renewal and Expansion Management test passed.');

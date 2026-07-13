const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'sustainability-target-management',name:'Sustainability Target Management'});
if(row.domain!=='sustainability-target-management'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['sustainability-target-management']!==1)process.exit(1);
console.log('Sprint 591 Sustainability Target Management test passed.');

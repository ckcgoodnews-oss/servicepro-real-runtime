const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'water-usage-monitoring',name:'Water Usage Monitoring'});
if(row.domain!=='water-usage-monitoring'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['water-usage-monitoring']!==1)process.exit(1);
console.log('Sprint 590 Water Usage Monitoring test passed.');

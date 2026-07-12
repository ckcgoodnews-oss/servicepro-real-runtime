const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'waste-stream-tracking',name:'Waste Stream Tracking'});
if(row.domain!=='waste-stream-tracking'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['waste-stream-tracking']!==1)process.exit(1);
console.log('Sprint 585 Waste Stream Tracking test passed.');

const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'circular-asset-lifecycle',name:'Circular Asset Lifecycle'});
if(row.domain!=='circular-asset-lifecycle'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['circular-asset-lifecycle']!==1)process.exit(1);
console.log('Sprint 586 Circular Asset Lifecycle test passed.');

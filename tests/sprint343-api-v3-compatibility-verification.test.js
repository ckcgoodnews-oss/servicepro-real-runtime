const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'api-v3-compatibility-verification',name:'API V3 Compatibility Verification'});
if(row.domain!=='api-v3-compatibility-verification'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['api-v3-compatibility-verification']!==1)process.exit(1);
console.log('Sprint 343 API V3 Compatibility Verification test passed.');

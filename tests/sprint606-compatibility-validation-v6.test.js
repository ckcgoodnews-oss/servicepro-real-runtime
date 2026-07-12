const svc=require('../apps/api/src/services/phase38Version6FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'compatibility-validation-v6',name:'Compatibility Validation V6'});
if(row.domain!=='compatibility-validation-v6'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['compatibility-validation-v6']!==1)process.exit(1);
console.log('Sprint 606 Compatibility Validation V6 test passed.');

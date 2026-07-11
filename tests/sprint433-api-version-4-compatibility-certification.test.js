const svc=require('../apps/api/src/services/phase27Version4GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'api-version-4-compatibility-certification',name:'API Version 4 Compatibility Certification'});
if(row.domain!=='api-version-4-compatibility-certification'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['api-version-4-compatibility-certification']!==1)process.exit(1);
console.log('Sprint 433 API Version 4 Compatibility Certification test passed.');

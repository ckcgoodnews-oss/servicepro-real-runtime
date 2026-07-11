const svc=require('../apps/api/src/services/phase27Version4GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-4-load-certification',name:'Version 4 Load Certification'});
if(row.domain!=='version-4-load-certification'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-4-load-certification']!==1)process.exit(1);
console.log('Sprint 436 Version 4 Load Certification test passed.');

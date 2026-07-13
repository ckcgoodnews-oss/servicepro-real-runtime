const svc=require('../apps/api/src/services/phase45Version7GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-7-production-readiness',name:'Version 7 Production Readiness'});
if(row.domain!=='version-7-production-readiness'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-7-production-readiness']!==1)process.exit(1);
console.log('Sprint 713 Version 7 Production Readiness test passed.');

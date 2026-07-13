const svc=require('../apps/api/src/services/phase39Version6GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-6-general-availability',name:'Version 6 General Availability'});
if(row.domain!=='version-6-general-availability'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-6-general-availability']!==1)process.exit(1);
console.log('Sprint 625 Version 6 General Availability test passed.');

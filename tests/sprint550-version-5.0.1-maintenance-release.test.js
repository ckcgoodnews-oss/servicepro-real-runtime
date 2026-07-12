const svc=require('../apps/api/src/services/phase34Version5PostGaAssuranceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-5.0.1-maintenance-release',name:'Version 5.0.1 Maintenance Release'});
if(row.domain!=='version-5.0.1-maintenance-release'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-5.0.1-maintenance-release']!==1)process.exit(1);
console.log('Sprint 550 Version 5.0.1 Maintenance Release test passed.');

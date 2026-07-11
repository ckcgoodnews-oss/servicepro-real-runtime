const svc=require('../apps/api/src/services/phase27Version4GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-4-rc-telemetry',name:'Version 4 RC Telemetry'});
if(row.domain!=='version-4-rc-telemetry'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-4-rc-telemetry']!==1)process.exit(1);
console.log('Sprint 431 Version 4 RC Telemetry test passed.');

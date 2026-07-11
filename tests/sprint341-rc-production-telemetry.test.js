const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'rc-production-telemetry',name:'RC Production Telemetry'});
if(row.domain!=='rc-production-telemetry'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['rc-production-telemetry']!==1)process.exit(1);
console.log('Sprint 341 RC Production Telemetry test passed.');

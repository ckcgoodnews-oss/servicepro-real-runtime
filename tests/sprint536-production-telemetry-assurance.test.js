const svc=require('../apps/api/src/services/phase34Version5PostGaAssuranceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'production-telemetry-assurance',name:'Production Telemetry Assurance'});
if(row.domain!=='production-telemetry-assurance'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['production-telemetry-assurance']!==1)process.exit(1);
console.log('Sprint 536 Production Telemetry Assurance test passed.');

const svc=require('../apps/api/src/services/phase41DigitalTwinSimulationPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'telemetry-synchronization',name:'Telemetry Synchronization'});
if(row.domain!=='telemetry-synchronization'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['telemetry-synchronization']!==1)process.exit(1);
console.log('Sprint 643 Telemetry Synchronization test passed.');

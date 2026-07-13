const svc=require('../apps/api/src/services/phase41DigitalTwinSimulationPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'digital-twin-release-readiness',name:'Digital Twin Release Readiness'});
if(row.domain!=='digital-twin-release-readiness'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['digital-twin-release-readiness']!==1)process.exit(1);
console.log('Sprint 655 Digital Twin Release Readiness test passed.');

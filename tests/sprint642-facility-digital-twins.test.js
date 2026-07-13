const svc=require('../apps/api/src/services/phase41DigitalTwinSimulationPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'facility-digital-twins',name:'Facility Digital Twins'});
if(row.domain!=='facility-digital-twins'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['facility-digital-twins']!==1)process.exit(1);
console.log('Sprint 642 Facility Digital Twins test passed.');

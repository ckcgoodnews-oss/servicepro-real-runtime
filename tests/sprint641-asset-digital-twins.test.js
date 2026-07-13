const svc=require('../apps/api/src/services/phase41DigitalTwinSimulationPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'asset-digital-twins',name:'Asset Digital Twins'});
if(row.domain!=='asset-digital-twins'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['asset-digital-twins']!==1)process.exit(1);
console.log('Sprint 641 Asset Digital Twins test passed.');

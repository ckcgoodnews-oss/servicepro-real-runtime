const svc=require('../apps/api/src/services/phase30ConnectedAssetsEdgeService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'sensor-health-monitoring',name:'Sensor Health Monitoring'});
if(row.domain!=='sensor-health-monitoring'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['sensor-health-monitoring']!==1)process.exit(1);
console.log('Sprint 482 Sensor Health Monitoring test passed.');

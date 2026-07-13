const svc=require('../apps/api/src/services/phase41DigitalTwinSimulationPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'simulation-experiment-management',name:'Simulation Experiment Management'});
if(row.domain!=='simulation-experiment-management'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['simulation-experiment-management']!==1)process.exit(1);
console.log('Sprint 652 Simulation Experiment Management test passed.');

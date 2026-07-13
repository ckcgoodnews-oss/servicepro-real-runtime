const svc=require('../apps/api/src/services/phase41DigitalTwinSimulationPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'what-if-analysis',name:'What If Analysis'});
if(row.domain!=='what-if-analysis'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['what-if-analysis']!==1)process.exit(1);
console.log('Sprint 645 What If Analysis test passed.');

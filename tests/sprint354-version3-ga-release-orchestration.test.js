const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version3-ga-release-orchestration',name:'Version 3 GA Release Orchestration'});
if(row.domain!=='version3-ga-release-orchestration'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version3-ga-release-orchestration']!==1)process.exit(1);
console.log('Sprint 354 Version 3 GA Release Orchestration test passed.');

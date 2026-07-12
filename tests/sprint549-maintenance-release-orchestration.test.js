const svc=require('../apps/api/src/services/phase34Version5PostGaAssuranceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'maintenance-release-orchestration',name:'Maintenance Release Orchestration'});
if(row.domain!=='maintenance-release-orchestration'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['maintenance-release-orchestration']!==1)process.exit(1);
console.log('Sprint 549 Maintenance Release Orchestration test passed.');

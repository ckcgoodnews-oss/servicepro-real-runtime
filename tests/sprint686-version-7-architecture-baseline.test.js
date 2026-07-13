const svc=require('../apps/api/src/services/phase44Version7FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-7-architecture-baseline',name:'Version 7 Architecture Baseline'});
if(row.domain!=='version-7-architecture-baseline'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-7-architecture-baseline']!==1)process.exit(1);
console.log('Sprint 686 Version 7 Architecture Baseline test passed.');

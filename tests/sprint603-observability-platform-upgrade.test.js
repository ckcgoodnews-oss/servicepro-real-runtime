const svc=require('../apps/api/src/services/phase38Version6FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'observability-platform-upgrade',name:'Observability Platform Upgrade'});
if(row.domain!=='observability-platform-upgrade'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['observability-platform-upgrade']!==1)process.exit(1);
console.log('Sprint 603 Observability Platform Upgrade test passed.');

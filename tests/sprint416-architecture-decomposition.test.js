const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'architecture-decomposition',name:'Architecture Decomposition'});
if(row.domain!=='architecture-decomposition'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['architecture-decomposition']!==1)process.exit(1);
console.log('Sprint 416 Architecture Decomposition test passed.');

const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'production-deployment-readiness',name:'Production Deployment Readiness'});
if(row.domain!=='production-deployment-readiness'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['production-deployment-readiness']!==1)process.exit(1);
console.log('Sprint 353 Production Deployment Readiness test passed.');

const svc=require('../apps/api/src/services/phase25EnterpriseFederationEcosystemService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'shared-service-operations',name:'Shared Service Operations'});
if(row.domain!=='shared-service-operations'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['shared-service-operations']!==1)process.exit(1);
console.log('Sprint 407 Shared Service Operations test passed.');

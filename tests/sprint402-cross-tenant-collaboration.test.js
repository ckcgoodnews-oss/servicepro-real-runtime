const svc=require('../apps/api/src/services/phase25EnterpriseFederationEcosystemService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'cross-tenant-collaboration',name:'Cross-Tenant Collaboration'});
if(row.domain!=='cross-tenant-collaboration'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['cross-tenant-collaboration']!==1)process.exit(1);
console.log('Sprint 402 Cross-Tenant Collaboration test passed.');

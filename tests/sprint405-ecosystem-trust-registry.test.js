const svc=require('../apps/api/src/services/phase25EnterpriseFederationEcosystemService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'ecosystem-trust-registry',name:'Ecosystem Trust Registry'});
if(row.domain!=='ecosystem-trust-registry'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['ecosystem-trust-registry']!==1)process.exit(1);
console.log('Sprint 405 Ecosystem Trust Registry test passed.');

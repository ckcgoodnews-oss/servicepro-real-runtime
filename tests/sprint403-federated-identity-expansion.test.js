const svc=require('../apps/api/src/services/phase25EnterpriseFederationEcosystemService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'federated-identity-expansion',name:'Federated Identity Expansion'});
if(row.domain!=='federated-identity-expansion'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['federated-identity-expansion']!==1)process.exit(1);
console.log('Sprint 403 Federated Identity Expansion test passed.');

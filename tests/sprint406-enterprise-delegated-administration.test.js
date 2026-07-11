const svc=require('../apps/api/src/services/phase25EnterpriseFederationEcosystemService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'enterprise-delegated-administration',name:'Enterprise Delegated Administration'});
if(row.domain!=='enterprise-delegated-administration'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['enterprise-delegated-administration']!==1)process.exit(1);
console.log('Sprint 406 Enterprise Delegated Administration test passed.');

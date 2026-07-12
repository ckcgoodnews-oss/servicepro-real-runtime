const svc=require('../apps/api/src/services/phase39Version6GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'api-v6-compatibility',name:'Api V6 Compatibility'});
if(row.domain!=='api-v6-compatibility'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['api-v6-compatibility']!==1)process.exit(1);
console.log('Sprint 613 Api V6 Compatibility test passed.');

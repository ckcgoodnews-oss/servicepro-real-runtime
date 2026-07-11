const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'hipaa-extensions',name:'HIPAA Extensions'});
if(row.domain!=='hipaa-extensions'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 241 HIPAA Extensions test passed.');

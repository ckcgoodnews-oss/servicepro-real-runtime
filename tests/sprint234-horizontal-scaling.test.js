const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'horizontal-scaling',name:'Horizontal Scaling'});
if(row.domain!=='horizontal-scaling'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 234 Horizontal Scaling test passed.');

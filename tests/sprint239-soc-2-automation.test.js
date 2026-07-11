const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'soc-2-automation',name:'SOC 2 Automation'});
if(row.domain!=='soc-2-automation'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 239 SOC 2 Automation test passed.');

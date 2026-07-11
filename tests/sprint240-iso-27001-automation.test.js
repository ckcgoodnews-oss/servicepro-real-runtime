const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'iso-27001-automation',name:'ISO 27001 Automation'});
if(row.domain!=='iso-27001-automation'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 240 ISO 27001 Automation test passed.');

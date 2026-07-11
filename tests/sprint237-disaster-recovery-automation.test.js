const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'disaster-recovery-automation',name:'Disaster Recovery Automation'});
if(row.domain!=='disaster-recovery-automation'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 237 Disaster Recovery Automation test passed.');

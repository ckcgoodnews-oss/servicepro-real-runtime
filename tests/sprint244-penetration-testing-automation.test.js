const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'penetration-testing-automation',name:'Penetration Testing Automation'});
if(row.domain!=='penetration-testing-automation'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 244 Penetration Testing Automation test passed.');

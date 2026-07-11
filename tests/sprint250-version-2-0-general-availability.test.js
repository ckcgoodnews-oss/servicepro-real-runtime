const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-2-0-general-availability',name:'Version 2.0 General Availability'});
if(row.domain!=='version-2-0-general-availability'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 250 Version 2.0 General Availability test passed.');

const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-2-upgrade-tooling',name:'Version 2 Upgrade Tooling'});
if(row.domain!=='version-2-upgrade-tooling'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 246 Version 2 Upgrade Tooling test passed.');

const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'vector-database-administration',name:'Vector Database Administration'});
if(row.domain!=='vector-database-administration'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 175 Vector Database Administration test passed.');

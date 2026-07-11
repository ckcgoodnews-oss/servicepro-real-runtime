const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'knowledge-synchronization',name:'Knowledge Synchronization'});
if(row.domain!=='knowledge-synchronization'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 174 Knowledge Synchronization test passed.');

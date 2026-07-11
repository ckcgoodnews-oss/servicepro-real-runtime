const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'prompt-version-management',name:'Prompt Version Management'});
if(row.domain!=='prompt-version-management'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 172 Prompt Version Management test passed.');

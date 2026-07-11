const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'enterprise-prompt-library',name:'Enterprise Prompt Library'});
if(row.domain!=='enterprise-prompt-library'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 171 Enterprise Prompt Library test passed.');

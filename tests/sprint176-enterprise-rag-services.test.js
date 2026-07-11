const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'enterprise-rag-services',name:'Enterprise RAG Services'});
if(row.domain!=='enterprise-rag-services'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 176 Enterprise RAG Services test passed.');

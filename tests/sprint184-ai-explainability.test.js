const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'ai-explainability',name:'AI Explainability'});
if(row.domain!=='ai-explainability'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 184 AI Explainability test passed.');

const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'ai-workflow-builder',name:'AI Workflow Builder'});
if(row.domain!=='ai-workflow-builder'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 173 AI Workflow Builder test passed.');

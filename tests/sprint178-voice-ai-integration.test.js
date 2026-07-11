const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'voice-ai-integration',name:'Voice AI Integration'});
if(row.domain!=='voice-ai-integration'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 178 Voice AI Integration test passed.');

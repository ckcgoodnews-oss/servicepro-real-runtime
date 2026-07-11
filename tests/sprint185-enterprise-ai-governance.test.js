const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'enterprise-ai-governance',name:'Enterprise AI Governance'});
if(row.domain!=='enterprise-ai-governance'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 185 Enterprise AI Governance test passed.');

const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'ai-cost-governance',name:'AI Cost Governance'});
if(row.domain!=='ai-cost-governance'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 183 AI Cost Governance test passed.');

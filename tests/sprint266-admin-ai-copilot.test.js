const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'admin-ai-copilot',name:'Admin Ai Copilot'});
if(row.domain!=='admin-ai-copilot'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['admin-ai-copilot']!==1)process.exit(1);
console.log('Sprint 266 Admin Ai Copilot test passed.');

const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'technician-ai-copilot',name:'Technician Ai Copilot'});
if(row.domain!=='technician-ai-copilot'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['technician-ai-copilot']!==1)process.exit(1);
console.log('Sprint 267 Technician Ai Copilot test passed.');

const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'ai-safety-guardrails',name:'Ai Safety Guardrails'});
if(row.domain!=='ai-safety-guardrails'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['ai-safety-guardrails']!==1)process.exit(1);
console.log('Sprint 278 Ai Safety Guardrails test passed.');

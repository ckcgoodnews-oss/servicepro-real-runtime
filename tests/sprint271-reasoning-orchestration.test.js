const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'reasoning-orchestration',name:'Reasoning Orchestration'});
if(row.domain!=='reasoning-orchestration'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['reasoning-orchestration']!==1)process.exit(1);
console.log('Sprint 271 Reasoning Orchestration test passed.');

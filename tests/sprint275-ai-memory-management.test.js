const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'ai-memory-management',name:'Ai Memory Management'});
if(row.domain!=='ai-memory-management'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['ai-memory-management']!==1)process.exit(1);
console.log('Sprint 275 Ai Memory Management test passed.');

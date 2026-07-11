const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'enterprise-knowledge-graph',name:'Enterprise Knowledge Graph'});
if(row.domain!=='enterprise-knowledge-graph'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['enterprise-knowledge-graph']!==1)process.exit(1);
console.log('Sprint 270 Enterprise Knowledge Graph test passed.');

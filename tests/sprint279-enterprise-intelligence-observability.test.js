const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'enterprise-intelligence-observability',name:'Enterprise Intelligence Observability'});
if(row.domain!=='enterprise-intelligence-observability'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['enterprise-intelligence-observability']!==1)process.exit(1);
console.log('Sprint 279 Enterprise Intelligence Observability test passed.');

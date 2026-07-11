const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'semantic-enterprise-search',name:'Semantic Enterprise Search'});
if(row.domain!=='semantic-enterprise-search'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['semantic-enterprise-search']!==1)process.exit(1);
console.log('Sprint 269 Semantic Enterprise Search test passed.');

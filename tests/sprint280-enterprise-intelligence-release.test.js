const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'enterprise-intelligence-release',name:'Enterprise Intelligence Release'});
if(row.domain!=='enterprise-intelligence-release'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['enterprise-intelligence-release']!==1)process.exit(1);
console.log('Sprint 280 Enterprise Intelligence Release test passed.');

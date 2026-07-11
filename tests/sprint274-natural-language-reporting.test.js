const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'natural-language-reporting',name:'Natural Language Reporting'});
if(row.domain!=='natural-language-reporting'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['natural-language-reporting']!==1)process.exit(1);
console.log('Sprint 274 Natural Language Reporting test passed.');

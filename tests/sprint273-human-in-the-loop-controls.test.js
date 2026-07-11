const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'human-in-the-loop-controls',name:'Human In The Loop Controls'});
if(row.domain!=='human-in-the-loop-controls'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['human-in-the-loop-controls']!==1)process.exit(1);
console.log('Sprint 273 Human In The Loop Controls test passed.');

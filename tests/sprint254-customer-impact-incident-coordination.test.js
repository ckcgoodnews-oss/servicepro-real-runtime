const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'customer-impact-incident-coordination',name:'Customer Impact Incident Coordination'});
if(row.domain!=='customer-impact-incident-coordination'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['customer-impact-incident-coordination']!==1)process.exit(1);
console.log('Sprint 254 Customer Impact Incident Coordination test passed.');

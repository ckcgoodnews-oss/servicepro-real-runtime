const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'long-term-support-channels',name:'Long Term Support Channels'});
if(row.domain!=='long-term-support-channels'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['long-term-support-channels']!==1)process.exit(1);
console.log('Sprint 258 Long Term Support Channels test passed.');

const svc=require('../apps/api/src/services/phase17GlobalScaleService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'timezone-calendar-localization',name:'Timezone Calendar Localization'});
if(row.domain!=='timezone-calendar-localization'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['timezone-calendar-localization']!==1)process.exit(1);
console.log('Sprint 290 Timezone Calendar Localization test passed.');

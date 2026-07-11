const svc=require('../apps/api/src/services/phase17GlobalScaleService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'global-notification-localization',name:'Global Notification Localization'});
if(row.domain!=='global-notification-localization'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['global-notification-localization']!==1)process.exit(1);
console.log('Sprint 289 Global Notification Localization test passed.');

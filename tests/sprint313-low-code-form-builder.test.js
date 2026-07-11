const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'low-code-form-builder',name:'Low Code Form Builder'});
if(row.domain!=='low-code-form-builder'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['low-code-form-builder']!==1)process.exit(1);
console.log('Sprint 313 Low Code Form Builder test passed.');

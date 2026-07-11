const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'marketplace-publishing-workflow',name:'Marketplace Publishing Workflow'});
if(row.domain!=='marketplace-publishing-workflow'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['marketplace-publishing-workflow']!==1)process.exit(1);
console.log('Sprint 317 Marketplace Publishing Workflow test passed.');

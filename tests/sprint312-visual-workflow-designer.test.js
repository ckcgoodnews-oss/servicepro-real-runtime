const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'visual-workflow-designer',name:'Visual Workflow Designer'});
if(row.domain!=='visual-workflow-designer'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['visual-workflow-designer']!==1)process.exit(1);
console.log('Sprint 312 Visual Workflow Designer test passed.');

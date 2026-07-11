const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'extension-security-sandbox',name:'Extension Security Sandbox'});
if(row.domain!=='extension-security-sandbox'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['extension-security-sandbox']!==1)process.exit(1);
console.log('Sprint 318 Extension Security Sandbox test passed.');

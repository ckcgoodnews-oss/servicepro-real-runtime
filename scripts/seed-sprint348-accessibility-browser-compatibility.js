const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'accessibility-browser-compatibility',name:'Accessibility Browser Compatibility',owner:'release-management'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));

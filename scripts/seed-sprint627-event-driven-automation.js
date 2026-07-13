const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase40HyperautomationEnterpriseOrchestration.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'event-driven-automation',name:'Event Driven Automation',owner:'platform'});
console.log(JSON.stringify(row,null,2));

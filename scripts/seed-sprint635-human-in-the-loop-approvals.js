const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase40HyperautomationEnterpriseOrchestration.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'human-in-the-loop-approvals',name:'Human In The Loop Approvals',owner:'platform'});
console.log(JSON.stringify(row,null,2));

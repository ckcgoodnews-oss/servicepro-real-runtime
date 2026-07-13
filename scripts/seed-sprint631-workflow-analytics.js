const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase40HyperautomationEnterpriseOrchestration.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'workflow-analytics',name:'Workflow Analytics',owner:'platform'});
console.log(JSON.stringify(row,null,2));

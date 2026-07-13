const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase40HyperautomationEnterpriseOrchestration.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'process-mining',name:'Process Mining',owner:'platform'});
console.log(JSON.stringify(row,null,2));

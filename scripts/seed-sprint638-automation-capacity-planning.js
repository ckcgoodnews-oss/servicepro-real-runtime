const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase40HyperautomationEnterpriseOrchestration.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'automation-capacity-planning',name:'Automation Capacity Planning',owner:'platform'});
console.log(JSON.stringify(row,null,2));

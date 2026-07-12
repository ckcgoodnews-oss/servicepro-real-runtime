const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase29AutonomousServiceOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'field-agent-copilot',name:'Field Agent Copilot',owner:'platform'});
console.log(JSON.stringify(row,null,2));

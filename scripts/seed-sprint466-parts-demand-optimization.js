const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase29AutonomousServiceOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'parts-demand-optimization',name:'Parts Demand Optimization',owner:'platform'});
console.log(JSON.stringify(row,null,2));

const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase29AutonomousServiceOperations;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'knowledge-gap-detection',name:'Knowledge Gap Detection',owner:'platform'});
console.log(JSON.stringify(row,null,2));

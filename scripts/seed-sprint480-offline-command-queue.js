const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase30ConnectedAssetsEdge;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'offline-command-queue',name:'Offline Command Queue',owner:'platform'});
console.log(JSON.stringify(row,null,2));

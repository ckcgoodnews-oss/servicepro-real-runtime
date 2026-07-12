const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase30ConnectedAssetsEdge;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'industrial-protocol-adapters',name:'Industrial Protocol Adapters',owner:'platform'});
console.log(JSON.stringify(row,null,2));

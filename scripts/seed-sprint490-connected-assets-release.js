const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase30ConnectedAssetsEdge;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'connected-assets-release',name:'Connected Assets Release',owner:'platform'});
console.log(JSON.stringify(row,null,2));

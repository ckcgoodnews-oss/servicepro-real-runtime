const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase31WorkforceCommerceNetwork;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'multi-party-work-orders',name:'Multi Party Work Orders',owner:'platform'});
console.log(JSON.stringify(row,null,2));

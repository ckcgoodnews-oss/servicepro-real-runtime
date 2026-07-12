const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase31WorkforceCommerceNetwork;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'workforce-capacity-exchange',name:'Workforce Capacity Exchange',owner:'platform'});
console.log(JSON.stringify(row,null,2));

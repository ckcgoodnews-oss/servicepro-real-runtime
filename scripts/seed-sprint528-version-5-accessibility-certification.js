const { getRepositories }=require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase33Version5Ga;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-5-accessibility-certification',name:'Version 5 Accessibility Certification',owner:'platform'});
console.log(JSON.stringify(row,null,2));

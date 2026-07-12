const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase38Version6FoundationRc;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'data-model-modernization',name:'Data Model Modernization',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));

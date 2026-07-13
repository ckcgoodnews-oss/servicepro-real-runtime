const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase44Version7FoundationRc.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-7-data-model',name:'Version 7 Data Model',owner:'platform'});
console.log(JSON.stringify(row,null,2));

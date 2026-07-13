const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase45Version7Ga.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'api-v7-compatibility',name:'Api V7 Compatibility',owner:'platform'});
console.log(JSON.stringify(row,null,2));

const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase45Version7Ga.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-7-production-readiness',name:'Version 7 Production Readiness',owner:'platform'});
console.log(JSON.stringify(row,null,2));

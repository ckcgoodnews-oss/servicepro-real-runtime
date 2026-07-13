const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase45Version7Ga.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-7-administrator-documentation',name:'Version 7 Administrator Documentation',owner:'platform'});
console.log(JSON.stringify(row,null,2));

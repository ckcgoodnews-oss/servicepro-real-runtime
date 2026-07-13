const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase45Version7Ga.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'database-v7-upgrade-certification',name:'Database V7 Upgrade Certification',owner:'platform'});
console.log(JSON.stringify(row,null,2));

const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase44Version7FoundationRc.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-7-accessibility-baseline',name:'Version 7 Accessibility Baseline',owner:'platform'});
console.log(JSON.stringify(row,null,2));

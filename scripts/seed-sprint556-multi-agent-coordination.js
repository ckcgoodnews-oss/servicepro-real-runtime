const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase35AgenticWorkforceOrchestration;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'multi-agent-coordination',name:'Multi-Agent Coordination',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));

const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main(){resetRepositoriesForTest(); const repos=getRepositories(); const tenantId=process.env.DEFAULT_TENANT_ID||'tenant_demo';
 const classification=await repos.dataGovernance.createClassificationPolicy(tenantId,{name:'Customer PII',entityType:'customers',classificationLevel:'confidential',pii:true,status:'active'});
 const retention=await repos.dataGovernance.createRetentionPolicy(tenantId,{name:'Closed Jobs Seven Year Retention',entityType:'jobs',retentionDays:2555,action:'archive',requiresApproval:true,status:'active'});
 const hold=await repos.dataGovernance.createLegalHold(tenantId,{name:'Example Customer Litigation Hold',entityType:'jobs',entityId:'job_hold_1',reason:'Do not purge records related to active dispute.',createdBy:'legal'});
 const evaluation=await repos.dataGovernance.evaluateRetention(tenantId,{entityType:'jobs',policyId:retention.id,asOfDate:'2026-07-06',record:{id:'job_old_1',completedAt:'2017-01-01'}});
 const planned=await repos.dataGovernance.planPurgeJob(tenantId,{policyId:retention.id,asOfDate:'2026-07-06',plannedBy:'system',records:[{id:'job_old_1',completedAt:'2017-01-01'},{id:'job_hold_1',completedAt:'2017-01-01'},{id:'job_new_1',completedAt:'2026-01-01'}]});
 if(repos.store.close) await repos.store.close(); console.log(JSON.stringify({ok:true,tenantId,classification,retention,hold,evaluation,planned},null,2));}
main().catch(err=>{console.error(err);process.exit(1);});

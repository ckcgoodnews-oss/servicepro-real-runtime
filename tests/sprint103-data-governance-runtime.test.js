const fs = require('fs');
const required=['apps/api/src/services/dataGovernanceService.js','apps/api/src/repositories/dataGovernanceRepository.js','apps/api/src/routes/dataGovernance.js','scripts/seed-data-governance.js','packages/database/postgres/103_data_governance_runtime.sql','docs/sprint103-data-governance-runtime.md'];
for(const file of required){ if(!fs.existsSync(file)){ console.error(`Missing required Sprint 103 patch file: ${file}`); process.exit(1); } }
const { addDays, daysBetween, normalizeClassificationPolicyInput, normalizeRetentionPolicyInput, normalizeLegalHoldInput, normalizePurgeJobInput, normalizeGovernanceDecisionInput, evaluateRetentionEligibility, planPurgeJob, approvePurgeJob, completePurgeJob } = require('../apps/api/src/services/dataGovernanceService');
if(addDays('2026-07-06',-10)!=='2026-06-26') process.exit(1);
if(daysBetween('2026-07-01','2026-07-06')!==5) process.exit(1);
const classification=normalizeClassificationPolicyInput({name:'Customer PII',entityType:'customers',classificationLevel:'confidential',pii:true});
if(classification.classificationLevel!=='confidential'||classification.pii!==true) process.exit(1);
const policy={id:'ret1',...normalizeRetentionPolicyInput({name:'Closed Jobs',entityType:'jobs',retentionDays:365,action:'archive'})};
const hold={id:'hold1',...normalizeLegalHoldInput({name:'Litigation hold',entityType:'jobs',entityId:'job2'})};
const eligible=evaluateRetentionEligibility({record:{id:'job1',completedAt:'2024-01-01'},policy,holds:[hold],asOfDate:'2026-07-06'});
if(!eligible.eligible||eligible.result!=='allow') process.exit(1);
const blocked=evaluateRetentionEligibility({record:{id:'job2',completedAt:'2024-01-01'},policy,holds:[hold],asOfDate:'2026-07-06'});
if(blocked.result!=='hold') process.exit(1);
const plan=planPurgeJob({policy,holds:[hold],records:[{id:'job1',completedAt:'2024-01-01'},{id:'job2',completedAt:'2024-01-01'},{id:'job3',completedAt:'2026-01-01'}],asOfDate:'2026-07-06',plannedBy:'system'});
if(plan.candidateCount!==1||plan.blocked.length!==2) process.exit(1);
let job=normalizePurgeJobInput(plan); job=approvePurgeJob(job,'owner'); if(job.status!=='approved') process.exit(1); job=completePurgeJob(job,1,0); if(job.status!=='completed') process.exit(1);
const decision=normalizeGovernanceDecisionInput({entityType:'jobs',action:'archive',result:'allow'}); if(decision.result!=='allow') process.exit(1);
console.log('Sprint 103 data governance runtime patch test passed.');

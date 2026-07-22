'use strict';
function evaluateMetric(metric, threshold={}) {
 const value=Number(metric.value); const max=threshold.max==null?null:Number(threshold.max); const min=threshold.min==null?null:Number(threshold.min);
 const passed=Number.isFinite(value)&&(max===null||value<=max)&&(min===null||value>=min);
 return {name:metric.name,value:Number.isFinite(value)?value:null,unit:metric.unit||null,min,max,passed};
}
function evaluatePostCutoverValidation({releaseId,healthChecks=[],metrics=[],rollback={},policy={}}){
 const checks=healthChecks.map((c,i)=>({id:c.id||`health-${i+1}`,required:c.required!==false,status:String(c.status||'unknown').toLowerCase(),passed:c.required===false||String(c.status||'').toLowerCase()==='passed',evidence:c.evidence||null}));
 const metricResults=metrics.map(m=>evaluateMetric(m,(policy.metricThresholds||{})[m.name]||{}));
 const failedChecks=checks.filter(c=>c.required&&!c.passed), failedMetrics=metricResults.filter(m=>!m.passed);
 const validated=failedChecks.length===0&&failedMetrics.length===0;
 const automaticRollback=policy.automaticRollback===true && !validated;
 return {schemaVersion:1,phase:71,sprint:774,control:'post-cutover-validation',releaseId,evaluatedAt:new Date().toISOString(),validated,failedChecks,failedMetrics,rollback:{required:!validated,automatic:automaticRollback,command:rollback.command||null,targetReleaseId:rollback.targetReleaseId||null},decision:validated?'confirm-ga':automaticRollback?'execute-rollback':'hold-and-review'};
}
module.exports={evaluateMetric,evaluatePostCutoverValidation};

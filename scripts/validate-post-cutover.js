#!/usr/bin/env node
'use strict';
const path=require('node:path'); const {evaluatePostCutoverValidation}=require('./lib/post-cutover-validation-engine'); const {readJson,writeJson}=require('./lib/ga-cutover-store');
const allowFailed=process.argv.includes('--allow-failed'),root=path.resolve(__dirname,'..');
const inputPath=path.resolve(root,process.env.POST_CUTOVER_INPUT_PATH||'release-evidence/post-cutover-input.json'); const policyPath=path.resolve(root,process.env.POST_CUTOVER_POLICY_PATH||'config/production/post-cutover-validation-policy.json'); const outputPath=path.resolve(root,process.env.POST_CUTOVER_REPORT_PATH||'release-evidence/post-cutover-report.json');
const input=readJson(inputPath,{releaseId:'local-verification',healthChecks:[],metrics:[],rollback:{}}),policy=readJson(policyPath,{}); const report=evaluatePostCutoverValidation({...input,policy}); writeJson(outputPath,report); process.stdout.write(`${JSON.stringify({inputPath,outputPath,report},null,2)}\n`); if(!report.validated&&!allowFailed)process.exitCode=13;

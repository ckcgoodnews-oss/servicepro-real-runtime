'use strict';
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'reports','release');
const manifest=path.join(dir,'immutable-release-bundle-manifest.json');
const sig=path.join(dir,'immutable-release-bundle-manifest.sig');
const record=path.join(dir,'release-signing-record.json');
const output=path.join(dir,'release-signature-verification.json');
const summary=path.join(dir,'release-signature-verification.md');
function die(m,e){console.error(`RELEASE SIGNATURE VERIFICATION FAILED: ${m}`);if(e?.stack)console.error(e.stack);process.exit(1)}
function git(a){const r=spawnSync('git',a,{cwd:root,encoding:'utf8',windowsHide:true});if(r.error||r.status!==0)throw new Error(`git ${a.join(' ')} failed`);return String(r.stdout||'').trim()}
function hash(p){return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}
function key(v){if(!v)throw new Error('RELEASE_SIGNING_PUBLIC_KEY is required.');const x=String(v).trim();return x.includes('BEGIN ')?x.replace(/\\n/g,'\n'):Buffer.from(x,'base64').toString('utf8')}
try{
 for(const p of [manifest,sig,record])if(!fs.existsSync(p))throw new Error(`Required signing evidence missing: ${p}`);
 const r=JSON.parse(fs.readFileSync(record,'utf8').replace(/^\uFEFF/,''));
 const commit=git(['rev-parse','HEAD']);
 const checks={signingResultValid:r.result==='signed',subjectDigestMatched:r.subject?.sha256===hash(manifest),sourceCommitMatched:r.source?.commit===commit,signatureVerified:crypto.verify(r.signature?.algorithm||'RSA-SHA256',fs.readFileSync(manifest),key(process.env.RELEASE_SIGNING_PUBLIC_KEY),Buffer.from(fs.readFileSync(sig,'utf8').trim(),'base64'))};
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length)throw new Error(`Signature verification checks failed: ${failed.join(', ')}`);
 const out={schemaVersion:1,result:'verified',verifiedAt:new Date().toISOString(),sourceCommit:commit,signer:r.signer,subject:r.subject,signature:r.signature,checks};
 fs.writeFileSync(output,JSON.stringify(out,null,2)+'\n');
 fs.writeFileSync(summary,['# ServicePro Release Signature Verification','','- Result: **VERIFIED**',`- Verified: ${out.verifiedAt}`,`- Commit: ${commit}`,`- Signer: ${out.signer.identity}`,'',...Object.entries(checks).map(([k,v])=>`- ${v?'PASS':'FAIL'} - ${k}`),''].join('\n'));
 console.log('\nRELEASE SIGNATURE VERIFICATION PASSED');console.log(`Verification: ${output}`);console.log(`Summary: ${summary}`);
}catch(e){die(e.message,e)}

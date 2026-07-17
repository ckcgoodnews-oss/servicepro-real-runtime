'use strict';
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'reports','release');
const manifest=path.join(dir,'immutable-release-bundle-manifest.json');
const sig=path.join(dir,'immutable-release-bundle-manifest.sig');
const record=path.join(dir,'release-signing-record.json');
const summary=path.join(dir,'release-signing-record.md');
function die(m,e){console.error(`RELEASE SIGNING FAILED: ${m}`);if(e?.stack)console.error(e.stack);process.exit(1)}
function git(a){const r=spawnSync('git',a,{cwd:root,encoding:'utf8',windowsHide:true});if(r.error||r.status!==0)throw new Error(`git ${a.join(' ')} failed`);return String(r.stdout||'').trim()}
function clean(){const s=git(['status','--porcelain','--untracked-files=all']);if(s)throw new Error(`Release signing requires a clean working tree.\n${s}`)}
function key(v,n){if(!v)throw new Error(`${n} is required.`);const x=String(v).trim();return x.includes('BEGIN ')?x.replace(/\\n/g,'\n'):Buffer.from(x,'base64').toString('utf8')}
function hash(p){return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}
try{
 clean();
 if(!fs.existsSync(manifest))throw new Error('Immutable release bundle manifest was not found.');
 const m=JSON.parse(fs.readFileSync(manifest,'utf8').replace(/^\uFEFF/,''));
 const commit=git(['rev-parse','HEAD']);
 if(m.result!=='sealed')throw new Error('Immutable release bundle manifest is not sealed.');
 if(m.source?.commit!==commit)throw new Error('Immutable release bundle commit does not match HEAD.');
 const privateKey=key(process.env.RELEASE_SIGNING_PRIVATE_KEY,'RELEASE_SIGNING_PRIVATE_KEY');
 const publicKey=key(process.env.RELEASE_SIGNING_PUBLIC_KEY,'RELEASE_SIGNING_PUBLIC_KEY');
 const payload=fs.readFileSync(manifest);
 const signature=crypto.sign('RSA-SHA256',payload,privateKey);
 if(!crypto.verify('RSA-SHA256',payload,publicKey,signature))throw new Error('Generated signature verification failed.');
 fs.writeFileSync(sig,signature.toString('base64')+'\n');
 const fingerprint=crypto.createHash('sha256').update(crypto.createPublicKey(publicKey).export({type:'spki',format:'der'})).digest('hex');
 const out={schemaVersion:1,result:'signed',signedAt:new Date().toISOString(),signer:{identity:process.env.RELEASE_SIGNER_IDENTITY||process.env.GITHUB_ACTOR||process.env.USERNAME||'unknown-signer',keyFingerprintSha256:fingerprint},source:{repository:git(['config','--get','remote.origin.url'])||'unknown',branch:process.env.GITHUB_REF_NAME||git(['branch','--show-current'])||'detached',commit,shortCommit:commit.slice(0,7)},subject:{path:'reports/release/immutable-release-bundle-manifest.json',sha256:hash(manifest)},signature:{path:'reports/release/immutable-release-bundle-manifest.sig',encoding:'base64',algorithm:'RSA-SHA256',verifiedAtCreation:true}};
 fs.writeFileSync(record,JSON.stringify(out,null,2)+'\n');
 fs.writeFileSync(summary,['# ServicePro Release Signing Record','','- Result: **SIGNED**',`- Signed: ${out.signedAt}`,`- Signer: ${out.signer.identity}`,`- Key fingerprint: ${fingerprint}`,`- Commit: ${commit}`,`- Subject SHA-256: ${out.subject.sha256}`,''].join('\n'));
 clean();
 console.log('\nRELEASE SIGNING PASSED');console.log(`Signature: ${sig}`);console.log(`Signing record: ${record}`);
}catch(e){die(e.message,e)}

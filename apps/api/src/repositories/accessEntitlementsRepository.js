const crypto = require('crypto');

function createAccessEntitlementsRepository(store) {
  if (store.type === 'json') return createJson(store);
  return createPostgres(store);
}

function createJson(store) {
  const data = () => { const value = store.read(); value.ownerAccessEntitlements ||= []; value.users ||= []; return value; };
  return {
    async listOwners() { const d=data(); return d.users.filter(u=>(u.roles||[]).includes('owner')).map(u=>({...u,entitlement:d.ownerAccessEntitlements.filter(e=>e.userId===u.id).at(-1)||null})); },
    async issue(input) { const d=data(); const row={id:crypto.randomUUID(),...input,status:'pending',activatedAt:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}; d.ownerAccessEntitlements.push(row);store.write(d);return row; },
    async redeem(tenantId,userId,tokenHash){const d=data();const row=d.ownerAccessEntitlements.find(e=>e.tenantId===tenantId&&e.userId===userId&&e.tokenHash===tokenHash&&e.status==='pending'&&Date.parse(e.expiresAt)>Date.now());if(!row)return null;row.status='active';row.activatedAt=new Date().toISOString();row.updatedAt=row.activatedAt;store.write(d);return row;},
    async current(tenantId,userId){const d=data();return d.ownerAccessEntitlements.filter(e=>e.tenantId===tenantId&&e.userId===userId).at(-1)||null;},
    async update(id,patch){const d=data();const row=d.ownerAccessEntitlements.find(e=>e.id===id);if(!row)return null;Object.assign(row,patch,{updatedAt:new Date().toISOString()});store.write(d);return row;}
  };
}

function createPostgres(store) {
  const select=`SELECT e.id::text,e.tenant_id AS "tenantId",e.user_id::text AS "userId",e.token_last_four AS "tokenLastFour",e.status,e.expires_at AS "expiresAt",e.activated_at AS "activatedAt",e.created_at AS "createdAt",e.updated_at AS "updatedAt" FROM runtime_owner_access_entitlements e`;
  return {
    async listOwners(){const r=await store.query(`SELECT u.id::text,u.tenant_id AS "tenantId",u.email,u.name,u.roles,e.id::text AS "entitlementId",e.status,e.expires_at AS "expiresAt",e.activated_at AS "activatedAt",e.token_last_four AS "tokenLastFour" FROM runtime_users u LEFT JOIN LATERAL (SELECT * FROM runtime_owner_access_entitlements x WHERE x.tenant_id=u.tenant_id AND x.user_id=u.id ORDER BY x.created_at DESC LIMIT 1) e ON true WHERE u.roles ? 'owner' ORDER BY lower(u.email)`);return r.rows;},
    async issue(input){await store.query(`UPDATE runtime_owner_access_entitlements SET status='revoked',updated_at=now() WHERE tenant_id=$1 AND user_id=$2::uuid AND status IN ('pending','active')`,[input.tenantId,input.userId]);const r=await store.query(`INSERT INTO runtime_owner_access_entitlements(tenant_id,user_id,token_hash,token_last_four,expires_at,created_by) VALUES($1,$2::uuid,$3,$4,$5,$6::uuid) RETURNING id::text,tenant_id AS "tenantId",user_id::text AS "userId",token_last_four AS "tokenLastFour",status,expires_at AS "expiresAt"`,[input.tenantId,input.userId,input.tokenHash,input.tokenLastFour,input.expiresAt,input.createdBy]);return r.rows[0];},
    async redeem(tenantId,userId,tokenHash){const r=await store.query(`UPDATE runtime_owner_access_entitlements SET status='active',activated_at=now(),updated_at=now() WHERE tenant_id=$1 AND user_id=$2::uuid AND token_hash=$3 AND status='pending' AND expires_at>now() RETURNING id::text,status,expires_at AS "expiresAt"`,[tenantId,userId,tokenHash]);return r.rows[0]||null;},
    async current(tenantId,userId){const r=await store.query(`${select} WHERE e.tenant_id=$1 AND e.user_id=$2::uuid ORDER BY e.created_at DESC LIMIT 1`,[tenantId,userId]);return r.rows[0]||null;},
    async update(id,patch){const r=await store.query(`UPDATE runtime_owner_access_entitlements SET status=COALESCE($2,status),expires_at=COALESCE($3,expires_at),updated_at=now() WHERE id=$1::uuid RETURNING id::text,tenant_id AS "tenantId",user_id::text AS "userId",status,expires_at AS "expiresAt"`,[id,patch.status||null,patch.expiresAt||null]);return r.rows[0]||null;}
  };
}

module.exports={createAccessEntitlementsRepository};

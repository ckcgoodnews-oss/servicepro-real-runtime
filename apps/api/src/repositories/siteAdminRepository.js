// This registry is separate from tenant-editable user roles and permissions.
function createSiteAdminRepository(store) {
  if (store.type === 'json') {
    const read = () => { const data = store.read(); data.siteAdmins ||= []; return data; };
    return {
      async has(tenantId, userId) { return read().siteAdmins.some(row => row.tenantId === tenantId && row.userId === userId); },
      async list() { return read().siteAdmins; },
      async grant(input) {
        const data = read();
        if (!data.siteAdmins.some(row => row.tenantId === input.tenantId && row.userId === input.userId)) data.siteAdmins.push({...input, createdAt: new Date().toISOString()});
        store.write(data);
      },
      async revoke(tenantId, userId) { const data = read(); data.siteAdmins = data.siteAdmins.filter(row => row.tenantId !== tenantId || row.userId !== userId); store.write(data); }
    };
  }
  return {
    async has(tenantId, userId) { return Boolean((await store.query('SELECT 1 FROM runtime_site_admins WHERE tenant_id=$1 AND user_id=$2', [tenantId,userId])).rows.length); },
    async list() { return (await store.query('SELECT tenant_id AS "tenantId",user_id::text AS "userId",created_at AS "createdAt" FROM runtime_site_admins ORDER BY created_at')).rows; },
    async grant({tenantId,userId,grantedBy}) { await store.query('INSERT INTO runtime_site_admins(tenant_id,user_id,granted_by) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', [tenantId,userId,grantedBy]); },
    async revoke(tenantId,userId) { await store.query('DELETE FROM runtime_site_admins WHERE tenant_id=$1 AND user_id=$2',[tenantId,userId]); }
  };
}
module.exports = {createSiteAdminRepository};

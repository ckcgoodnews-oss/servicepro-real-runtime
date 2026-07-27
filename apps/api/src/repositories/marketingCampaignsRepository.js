const { makeId, now } = require('../services/id');

function createMarketingCampaignsRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    listCampaigns(tenantId, filters = {}) {
      const d = data();
      d.marketingCampaigns ||= [];
      let results = d.marketingCampaigns.filter(c => c.tenantId === tenantId);
      if (filters.status) results = results.filter(c => c.status === filters.status);
      if (filters.type) results = results.filter(c => c.type === filters.type);
      return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    findCampaignById(tenantId, id) {
      const d = data();
      d.marketingCampaigns ||= [];
      return d.marketingCampaigns.find(c => c.tenantId === tenantId && c.id === id) || null;
    },

    createCampaign(tenantId, input) {
      const d = data();
      d.marketingCampaigns ||= [];
      if (!input.name) { const err = new Error('Campaign name is required'); err.status = 400; err.code = 'validation_failed'; throw err; }
      const campaign = {
        id: makeId('campaign'),
        tenantId,
        name: input.name,
        type: input.type || 'email',
        status: 'draft',
        subject: input.subject || '',
        body: input.body || '',
        audience: input.audience || 'all_customers',
        audienceFilter: input.audienceFilter || {},
        scheduledAt: input.scheduledAt || '',
        sentCount: 0,
        openedCount: 0,
        clickedCount: 0,
        convertedCount: 0,
        createdBy: input.createdBy || '',
        createdAt: now(),
        updatedAt: now()
      };
      d.marketingCampaigns.push(campaign);
      save(d);
      return campaign;
    },

    updateCampaign(tenantId, id, input) {
      const d = data();
      d.marketingCampaigns ||= [];
      const campaign = d.marketingCampaigns.find(c => c.tenantId === tenantId && c.id === id);
      if (!campaign) return null;
      for (const key of ['name', 'type', 'status', 'subject', 'body', 'audience', 'audienceFilter', 'scheduledAt', 'sentCount', 'openedCount', 'clickedCount', 'convertedCount']) {
        if (input[key] !== undefined) campaign[key] = input[key];
      }
      campaign.updatedAt = now();
      save(d);
      return campaign;
    },

    deleteCampaign(tenantId, id) {
      const d = data();
      d.marketingCampaigns ||= [];
      const idx = d.marketingCampaigns.findIndex(c => c.tenantId === tenantId && c.id === id);
      if (idx < 0) return null;
      const removed = d.marketingCampaigns.splice(idx, 1)[0];
      save(d);
      return removed;
    },

    getStats(tenantId) {
      const campaigns = this.listCampaigns(tenantId);
      return {
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'active').length,
        draft: campaigns.filter(c => c.status === 'draft').length,
        completed: campaigns.filter(c => c.status === 'completed').length,
        totalSent: campaigns.reduce((s, c) => s + c.sentCount, 0),
        totalOpened: campaigns.reduce((s, c) => s + c.openedCount, 0),
        totalConverted: campaigns.reduce((s, c) => s + c.convertedCount, 0),
        avgOpenRate: campaigns.filter(c => c.sentCount > 0).length > 0
          ? Math.round(campaigns.reduce((s, c) => s + (c.sentCount > 0 ? c.openedCount / c.sentCount : 0), 0) / campaigns.filter(c => c.sentCount > 0).length * 100)
          : 0
      };
    }
  };
}

function createPostgresImpl(store) {
  const select = `SELECT id::text, tenant_id as "tenantId", name, type, status, subject, body, audience,
    audience_filter as "audienceFilter", scheduled_at as "scheduledAt", sent_count as "sentCount",
    opened_count as "openedCount", clicked_count as "clickedCount", converted_count as "convertedCount",
    created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt" FROM marketing_campaigns`;
  return {
    async listCampaigns(tenantId, filters = {}) {
      const values = [tenantId];
      const where = ['tenant_id=$1'];
      for (const [column, value] of [['status', filters.status], ['type', filters.type]]) {
        if (value) { values.push(value); where.push(`${column}=$${values.length}`); }
      }
      return (await store.query(`${select} WHERE ${where.join(' AND ')} ORDER BY created_at DESC`, values)).rows;
    },
    async findCampaignById(tenantId, id) {
      return (await store.query(`${select} WHERE tenant_id=$1 AND id=$2::uuid LIMIT 1`, [tenantId, id])).rows[0] || null;
    },
    async createCampaign(tenantId, input) {
      if (!input.name) { const error = new Error('Campaign name is required'); error.status = 400; error.code = 'validation_failed'; throw error; }
      return (await store.query(
        `INSERT INTO marketing_campaigns
          (tenant_id,name,channel,type,status,subject,body,audience,audience_filter,scheduled_at,created_by)
         VALUES ($1,$2,$3,$3,'draft',$4,$5,$6,$7::jsonb,NULLIF($8,'')::timestamptz,$9)
         RETURNING id::text, tenant_id as "tenantId", name, type, status, subject, body, audience,
           audience_filter as "audienceFilter", scheduled_at as "scheduledAt", sent_count as "sentCount",
           opened_count as "openedCount", clicked_count as "clickedCount", converted_count as "convertedCount",
           created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.name, input.type || 'email', input.subject || '', input.body || '', input.audience || 'all_customers',
          JSON.stringify(input.audienceFilter || {}), input.scheduledAt || '', input.createdBy || '']
      )).rows[0];
    },
    async updateCampaign(tenantId, id, input) {
      const existing = await this.findCampaignById(tenantId, id);
      if (!existing) return null;
      const next = { ...existing, ...input };
      return (await store.query(
        `UPDATE marketing_campaigns SET name=$3,type=$4,status=$5,subject=$6,body=$7,audience=$8,
           audience_filter=$9::jsonb,scheduled_at=NULLIF($10,'')::timestamptz,sent_count=$11,
           opened_count=$12,clicked_count=$13,converted_count=$14,updated_at=now()
         WHERE tenant_id=$1 AND id=$2::uuid
         RETURNING id::text, tenant_id as "tenantId", name, type, status, subject, body, audience,
           audience_filter as "audienceFilter", scheduled_at as "scheduledAt", sent_count as "sentCount",
           opened_count as "openedCount", clicked_count as "clickedCount", converted_count as "convertedCount",
           created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, next.name, next.type, next.status, next.subject, next.body, next.audience,
          JSON.stringify(next.audienceFilter || {}), next.scheduledAt || '', Number(next.sentCount || 0),
          Number(next.openedCount || 0), Number(next.clickedCount || 0), Number(next.convertedCount || 0)]
      )).rows[0] || null;
    },
    async deleteCampaign(tenantId, id) {
      return (await store.query('DELETE FROM marketing_campaigns WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text', [tenantId, id])).rows[0] || null;
    },
    async getStats(tenantId) {
      const rows = await this.listCampaigns(tenantId);
      const sent = rows.reduce((sum, row) => sum + row.sentCount, 0);
      const opened = rows.reduce((sum, row) => sum + row.openedCount, 0);
      return {
        total: rows.length,
        active: rows.filter(row => row.status === 'active').length,
        draft: rows.filter(row => row.status === 'draft').length,
        completed: rows.filter(row => row.status === 'completed').length,
        totalSent: sent,
        totalOpened: opened,
        totalConverted: rows.reduce((sum, row) => sum + row.convertedCount, 0),
        avgOpenRate: sent ? Math.round(opened / sent * 100) : 0
      };
    }
  };
}

module.exports = { createMarketingCampaignsRepository };

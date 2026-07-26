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
  return createJsonImpl(store);
}

module.exports = { createMarketingCampaignsRepository };

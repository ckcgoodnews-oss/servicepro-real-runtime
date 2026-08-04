const { makeId, now } = require('../services/id');

function createCampaignAttributionRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    record(tenantId, input) {
      const d = data();
      d.campaignAttributions ||= [];
      const attr = {
        id: makeId('attr'),
        tenantId,
        campaignId: input.campaign_id,
        campaignName: input.campaign_name || null,
        entityType: input.entity_type,
        entityId: input.entity_id,
        attributionModel: input.attribution_model || 'first_touch',
        touchType: input.touch_type,
        channel: input.channel || null,
        revenueAttributed: input.revenue_attributed || 0,
        utmSource: input.utm_source || null,
        utmMedium: input.utm_medium || null,
        utmContent: input.utm_content || null,
        occurredAt: input.occurred_at || now(),
        createdAt: now()
      };
      d.campaignAttributions.push(attr);
      save(d);
      return attr;
    },

    listForCampaign(tenantId, campaignId) {
      const d = data();
      d.campaignAttributions ||= [];
      return d.campaignAttributions.filter(a => a.tenantId === tenantId && a.campaignId === campaignId)
        .sort((a, b) => (b.occurredAt || '').localeCompare(a.occurredAt || ''));
    },

    listForEntity(tenantId, entityType, entityId) {
      const d = data();
      d.campaignAttributions ||= [];
      return d.campaignAttributions.filter(a => a.tenantId === tenantId && a.entityType === entityType && a.entityId === entityId)
        .sort((a, b) => (a.occurredAt || '').localeCompare(b.occurredAt || ''));
    },

    summary(tenantId, filters = {}) {
      const d = data();
      d.campaignAttributions ||= [];
      let results = d.campaignAttributions.filter(a => a.tenantId === tenantId);
      if (filters.campaign_id) results = results.filter(a => a.campaignId === filters.campaign_id);
      if (filters.channel) results = results.filter(a => a.channel === filters.channel);

      const byCampaign = {};
      for (const a of results) {
        if (!byCampaign[a.campaignId]) {
          byCampaign[a.campaignId] = {
            campaignId: a.campaignId, campaignName: a.campaignName,
            touchCount: 0, uniqueEntities: new Set(),
            totalRevenue: 0, byChannel: {}
          };
        }
        const c = byCampaign[a.campaignId];
        c.touchCount++;
        c.uniqueEntities.add(a.entityId);
        c.totalRevenue += a.revenueAttributed || 0;
        c.byChannel[a.channel || 'unknown'] = (c.byChannel[a.channel || 'unknown'] || 0) + 1;
      }
      return Object.values(byCampaign).map(c => ({
        ...c, uniqueEntities: c.uniqueEntities.size
      }));
    },

    // Campaign sends tracking
    recordSend(tenantId, input) {
      const d = data();
      d.campaignSends ||= [];
      const send = {
        id: makeId('send'),
        tenantId,
        campaignId: input.campaign_id,
        contactId: input.contact_id || null,
        email: input.email,
        status: 'queued',
        sentAt: null, openedAt: null, clickedAt: null,
        bounceReason: null,
        metadata: input.metadata || {},
        createdAt: now()
      };
      d.campaignSends.push(send);
      save(d);
      return send;
    },

    updateSendStatus(tenantId, sendId, status, metadata = {}) {
      const d = data();
      d.campaignSends ||= [];
      const idx = d.campaignSends.findIndex(s => s.tenantId === tenantId && s.id === sendId);
      if (idx === -1) return null;
      const send = d.campaignSends[idx];
      send.status = status;
      if (status === 'sent') send.sentAt = now();
      if (status === 'opened') send.openedAt = now();
      if (status === 'clicked') send.clickedAt = now();
      if (metadata.bounce_reason) send.bounceReason = metadata.bounce_reason;
      save(d);
      return send;
    },

    sendStats(tenantId, campaignId) {
      const d = data();
      d.campaignSends ||= [];
      const sends = d.campaignSends.filter(s => s.tenantId === tenantId && s.campaignId === campaignId);
      const total = sends.length;
      if (!total) return { total: 0, sent: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, open_rate: 0, click_rate: 0 };
      const sent = sends.filter(s => ['sent', 'delivered', 'opened', 'clicked'].includes(s.status)).length;
      const opened = sends.filter(s => s.openedAt).length;
      const clicked = sends.filter(s => s.clickedAt).length;
      const bounced = sends.filter(s => s.status === 'bounced').length;
      const unsubscribed = sends.filter(s => s.status === 'unsubscribed').length;
      return {
        total, sent, opened, clicked, bounced, unsubscribed,
        open_rate: sent > 0 ? parseFloat((opened / sent * 100).toFixed(1)) : 0,
        click_rate: opened > 0 ? parseFloat((clicked / opened * 100).toFixed(1)) : 0
      };
    }
  };
}

function createPostgresImpl(store) { return createJsonImpl(store); }
module.exports = { createCampaignAttributionRepository };

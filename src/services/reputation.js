const { byTenant } = require('../db/store');

function averageRating(tenantId) {
  const reviews = byTenant('reviews', tenantId);
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length;
}

function referralReport(tenantId) {
  const customers = byTenant('customers', tenantId);
  const sources = byTenant('referralSources', tenantId);
  return sources.map(source => {
    const count = customers.filter(c => c.referralSourceId === source.id).length;
    return { source, count };
  }).sort((a, b) => b.count - a.count);
}

function retentionMetrics(tenantId) {
  const customers = byTenant('customers', tenantId);
  const reminders = byTenant('serviceReminders', tenantId);
  const campaigns = byTenant('campaigns', tenantId);
  const reviewRequests = byTenant('reviewRequests', tenantId);
  return {
    customerCount: customers.length,
    activeReminders: reminders.filter(r => r.status !== 'completed').length,
    campaignCount: campaigns.length,
    pendingReviewRequests: reviewRequests.filter(r => r.status === 'pending').length,
    averageRating: averageRating(tenantId)
  };
}

function campaignRecipientPreview(tenantId, campaign) {
  const customers = byTenant('customers', tenantId);
  if (campaign.audience === 'all_customers') return customers;
  if (campaign.audience === 'customers_without_reviews') {
    const reviews = byTenant('reviews', tenantId);
    const reviewed = new Set(reviews.map(r => r.customerId));
    return customers.filter(c => !reviewed.has(c.id));
  }
  if (campaign.audience === 'customers_with_reminders') {
    const reminders = byTenant('serviceReminders', tenantId).filter(r => r.status !== 'completed');
    const ids = new Set(reminders.map(r => r.customerId));
    return customers.filter(c => ids.has(c.id));
  }
  return [];
}

module.exports = { averageRating, referralReport, retentionMetrics, campaignRecipientPreview };

const express = require('express');
const { byTenant, insert, update, audit, read } = require('../db/store');
const { requireOwner } = require('../middleware/auth');
const reputation = require('../services/reputation');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    title: 'Dashboard',
    metrics: reputation.retentionMetrics(req.tenant.id)
  });
});

router.get('/reputation', requireOwner, (req, res) => {
  res.render('admin/reputation', {
    title: 'Reputation Dashboard',
    metrics: reputation.retentionMetrics(req.tenant.id),
    referralRows: reputation.referralReport(req.tenant.id),
    reviews: byTenant('reviews', req.tenant.id)
  });
});

router.get('/reviews', requireOwner, (req, res) => {
  res.render('admin/reviews', {
    title: 'Reviews',
    reviews: byTenant('reviews', req.tenant.id),
    customers: byTenant('customers', req.tenant.id)
  });
});

router.post('/reviews', requireOwner, (req, res) => {
  const review = insert('reviews', {
    tenantId: req.tenant.id,
    customerId: req.body.customerId,
    jobId: req.body.jobId || '',
    rating: Number(req.body.rating || 0),
    source: req.body.source,
    comments: req.body.comments,
    receivedAt: req.body.receivedAt || new Date().toISOString()
  });
  audit(req.tenant.id, req.user.id, 'review.created', 'review', review.id, review);
  req.flash('success', 'Review saved.');
  res.redirect('/admin/reviews');
});

router.get('/review-requests', requireOwner, (req, res) => {
  res.render('admin/review-requests', {
    title: 'Review Requests',
    requests: byTenant('reviewRequests', req.tenant.id),
    customers: byTenant('customers', req.tenant.id)
  });
});

router.post('/review-requests', requireOwner, (req, res) => {
  const request = insert('reviewRequests', {
    tenantId: req.tenant.id,
    customerId: req.body.customerId,
    channel: req.body.channel,
    reviewUrl: req.body.reviewUrl || process.env.PUBLIC_REVIEW_URL || '',
    status: 'pending',
    sentAt: null
  });
  audit(req.tenant.id, req.user.id, 'review_request.queued', 'reviewRequest', request.id, request);
  req.flash('success', 'Review request queued.');
  res.redirect('/admin/review-requests');
});

router.post('/review-requests/:id/mark-sent', requireOwner, (req, res) => {
  update('reviewRequests', req.params.id, { status: 'sent', sentAt: new Date().toISOString() });
  audit(req.tenant.id, req.user.id, 'review_request.sent', 'reviewRequest', req.params.id, {});
  req.flash('success', 'Review request marked sent.');
  res.redirect('/admin/review-requests');
});

router.get('/referrals', requireOwner, (req, res) => {
  res.render('admin/referrals', {
    title: 'Referral Sources',
    sources: byTenant('referralSources', req.tenant.id),
    rows: reputation.referralReport(req.tenant.id)
  });
});

router.post('/referrals', requireOwner, (req, res) => {
  const source = insert('referralSources', {
    tenantId: req.tenant.id,
    name: req.body.name,
    category: req.body.category,
    active: true
  });
  audit(req.tenant.id, req.user.id, 'referral_source.created', 'referralSource', source.id, source);
  req.flash('success', 'Referral source added.');
  res.redirect('/admin/referrals');
});

router.get('/reminders', requireOwner, (req, res) => {
  res.render('admin/reminders', {
    title: 'Service Reminders',
    reminders: byTenant('serviceReminders', req.tenant.id),
    customers: byTenant('customers', req.tenant.id)
  });
});

router.post('/reminders', requireOwner, (req, res) => {
  const reminder = insert('serviceReminders', {
    tenantId: req.tenant.id,
    customerId: req.body.customerId,
    serviceType: req.body.serviceType,
    dueDate: req.body.dueDate,
    channel: req.body.channel,
    status: 'scheduled'
  });
  audit(req.tenant.id, req.user.id, 'service_reminder.created', 'serviceReminder', reminder.id, reminder);
  req.flash('success', 'Service reminder created.');
  res.redirect('/admin/reminders');
});

router.post('/reminders/:id/complete', requireOwner, (req, res) => {
  update('serviceReminders', req.params.id, { status: 'completed', completedAt: new Date().toISOString() });
  audit(req.tenant.id, req.user.id, 'service_reminder.completed', 'serviceReminder', req.params.id, {});
  req.flash('success', 'Reminder completed.');
  res.redirect('/admin/reminders');
});

router.get('/campaigns', requireOwner, (req, res) => {
  res.render('admin/campaigns', {
    title: 'Follow-up Campaigns',
    campaigns: byTenant('campaigns', req.tenant.id)
  });
});

router.post('/campaigns', requireOwner, (req, res) => {
  const campaign = insert('campaigns', {
    tenantId: req.tenant.id,
    name: req.body.name,
    audience: req.body.audience,
    channel: req.body.channel,
    subject: req.body.subject,
    body: req.body.body,
    status: 'draft'
  });
  audit(req.tenant.id, req.user.id, 'campaign.created', 'campaign', campaign.id, campaign);
  req.flash('success', 'Campaign created.');
  res.redirect('/admin/campaigns');
});

router.get('/campaigns/:id', requireOwner, (req, res) => {
  const campaign = byTenant('campaigns', req.tenant.id).find(c => c.id === req.params.id);
  if (!campaign) return res.status(404).render('errors/404', { title: 'Not Found' });
  res.render('admin/campaign-detail', {
    title: campaign.name,
    campaign,
    recipients: reputation.campaignRecipientPreview(req.tenant.id, campaign)
  });
});

router.post('/campaigns/:id/queue', requireOwner, (req, res) => {
  const campaign = byTenant('campaigns', req.tenant.id).find(c => c.id === req.params.id);
  if (!campaign) return res.status(404).render('errors/404', { title: 'Not Found' });
  const recipients = reputation.campaignRecipientPreview(req.tenant.id, campaign);
  const db = read();
  for (const customer of recipients) {
    db.campaignRecipients.push({
      id: `camprec_${Math.random().toString(36).slice(2, 10)}`,
      tenantId: req.tenant.id,
      campaignId: campaign.id,
      customerId: customer.id,
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  update('campaigns', campaign.id, { status: 'queued' });
  audit(req.tenant.id, req.user.id, 'campaign.queued', 'campaign', campaign.id, { recipientCount: recipients.length });
  req.flash('success', `Campaign queued for ${recipients.length} recipients.`);
  res.redirect(`/admin/campaigns/${campaign.id}`);
});

module.exports = router;

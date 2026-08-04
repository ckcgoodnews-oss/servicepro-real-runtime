const crypto = require('crypto');
const { sendJson } = require('../utils/http');
const trialMarketplace = require('../services/trialMarketplaceService');

/**
 * GET /api/v1/trial/marketplace/offerings
 * List marketplace offerings eligible for trial. Requires auth + active trial.
 */
async function listOfferings(req, res) {
  const offerings = trialMarketplace.getEligibleOfferings();
  return sendJson(res, 200, { data: { offerings, total: offerings.length } });
}

/**
 * POST /api/v1/trial/marketplace/select
 * Confirm 1–3 marketplace selections and trigger site provisioning.
 * Idempotent: re-submitting same selections returns existing site.
 */
async function confirmSelections(req, res) {
  const tenantId = req.context.tenantId;
  const { selections } = req.body || {};

  // Get trial
  const trial = await req.context.repositories.trials.findByTenantId(tenantId);
  if (!trial) return sendJson(res, 404, { error: { code: 'no_trial', message: 'No active trial found.' } });

  // Validate
  const validation = trialMarketplace.validateSelections(selections, trial);
  if (!validation.valid) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: validation.errors[0], details: validation.errors } });
  }

  // Idempotency: check if selections already confirmed
  const existingSite = await req.context.repositories.trialSites?.findByTrialId(trial.id);
  if (existingSite && existingSite.provisioning_state !== 'failed') {
    return sendJson(res, 200, { data: {
      siteId: existingSite.id,
      slug: existingSite.public_slug,
      provisioningState: existingSite.provisioning_state,
      message: 'Selections already confirmed. Site is provisioning or ready.',
      idempotent: true
    }});
  }

  // Persist offering snapshots
  const selectionRecords = [];
  for (let i = 0; i < validation.offerings.length; i++) {
    const offering = validation.offerings[i];
    selectionRecords.push({
      id: crypto.randomUUID(),
      trialId: trial.id,
      tenantId,
      offeringId: offering.id,
      offeringSnapshot: JSON.stringify(offering),
      sequence: i + 1
    });
  }

  if (req.context.repositories.trialSites?.createSelections) {
    await req.context.repositories.trialSites.createSelections(selectionRecords);
  }

  // Generate site content
  const tenantData = {
    companyName: trial.company_name || trial.companyName || 'My Business',
    contactEmail: trial.email,
    contactPhone: trial.phone || '',
    tagline: '',
    description: '',
    serviceArea: '',
    hours: '',
    logoUrl: ''
  };

  const siteContent = trialMarketplace.generateSiteContent(validation.offerings, tenantData);
  const slug = siteContent.slug;

  // Create trial site record
  const site = {
    id: crypto.randomUUID(),
    trialId: trial.id,
    tenantId,
    publicSlug: slug,
    provisioningState: 'processing',
    siteContent: JSON.stringify(siteContent),
    fieldStates: JSON.stringify(siteContent.fieldStates || {}),
    version: 1
  };

  if (req.context.repositories.trialSites?.createSite) {
    await req.context.repositories.trialSites.createSite(site);
  }

  // Update trial with site reference and selection confirmation
  await req.context.repositories.trials.update(trial.id, {
    trialSiteId: site.id,
    selectionsConfirmedAt: new Date().toISOString()
  });

  // Publish to tenant branding (uses existing storefront system)
  const branding = {
    publicSlug: slug,
    publicPublished: true,
    publicPublishedAt: new Date().toISOString(),
    publicTheme: 'evergreen',
    publicDescription: siteContent.description,
    publicTagline: siteContent.tagline,
    publicServiceIds: siteContent.services.map(s => s.id),
    publicServicePresentation: {},
    heroImageUrl: siteContent.heroImageUrl,
    primaryColor: siteContent.primaryColor,
    secondaryColor: siteContent.secondaryColor,
    trialBadge: true
  };

  // Populate service presentation
  for (const svc of siteContent.services) {
    branding.publicServicePresentation[svc.id] = {
      title: svc.name,
      description: svc.description,
      imageUrl: svc.imageUrl,
      pageHeadline: `${svc.name} you can depend on`,
      pageBody: svc.description,
      benefits: '',
      startingPrice: ''
    };
  }

  if (req.context.repositories.tenantSettings?.upsert) {
    const current = await req.context.repositories.tenantSettings.get(tenantId);
    await req.context.repositories.tenantSettings.upsert(tenantId, {
      branding: { ...(current?.branding || {}), ...branding },
      companyName: tenantData.companyName
    });
  }

  // Mark provisioning complete
  if (req.context.repositories.trialSites?.updateState) {
    await req.context.repositories.trialSites.updateState(site.id, 'ready', new Date().toISOString());
  }

  // Audit
  try {
    if (req.context.repositories.audit?.create) {
      await req.context.repositories.audit.create({
        tenantId,
        userId: req.context.userId,
        action: 'trial.site_provisioned',
        metadata: { siteId: site.id, slug, offerings: selections }
      });
    }
  } catch { /* graceful */ }

  return sendJson(res, 201, { data: {
    siteId: site.id,
    slug,
    publicUrl: `/p/${slug}`,
    provisioningState: 'ready',
    offerings: validation.offerings.map(o => ({ id: o.id, name: o.name })),
    message: 'Your site is live.'
  }});
}

/**
 * GET /api/v1/trial/site
 * Get current trial site status and content. Requires auth.
 */
async function getSite(req, res) {
  const tenantId = req.context.tenantId;
  const trial = await req.context.repositories.trials.findByTenantId(tenantId);
  if (!trial) return sendJson(res, 404, { error: { code: 'no_trial', message: 'No trial found.' } });

  const site = req.context.repositories.trialSites?.findByTrialId
    ? await req.context.repositories.trialSites.findByTrialId(trial.id)
    : null;

  if (!site) {
    return sendJson(res, 200, { data: { hasSite: false, provisioningState: null } });
  }

  const content = typeof site.site_content === 'string' ? JSON.parse(site.site_content) : (site.site_content || {});
  const trialStatus = trialMarketplace.trialStatusFromRecord(trial);

  return sendJson(res, 200, { data: {
    hasSite: true,
    siteId: site.id,
    slug: site.public_slug,
    publicUrl: `/p/${site.public_slug}`,
    provisioningState: site.provisioning_state,
    trialStatus,
    content,
    version: site.version,
    publishedAt: site.published_at,
    allowedEditFields: [...trialMarketplace.ALLOWED_EDIT_FIELDS]
  }});
}

/**
 * PATCH /api/v1/trial/site
 * Apply restricted edits to trial site. Requires auth + active trial.
 */
async function editSite(req, res) {
  const tenantId = req.context.tenantId;
  const trial = await req.context.repositories.trials.findByTenantId(tenantId);
  if (!trial) return sendJson(res, 404, { error: { code: 'no_trial', message: 'No trial found.' } });

  // Check trial is active
  const status = trialMarketplace.trialStatusFromRecord(trial);
  if (status === 'expired') {
    return sendJson(res, 403, { error: { code: 'trial_expired', message: 'Your trial has ended. Upgrade to continue editing.' } });
  }

  const site = req.context.repositories.trialSites?.findByTrialId
    ? await req.context.repositories.trialSites.findByTrialId(trial.id)
    : null;
  if (!site) return sendJson(res, 404, { error: { code: 'no_site', message: 'No site found.' } });

  const currentContent = typeof site.site_content === 'string' ? JSON.parse(site.site_content) : (site.site_content || {});
  const edits = req.body || {};

  const { content, applied, rejected } = trialMarketplace.applyEdits(currentContent, edits);

  if (applied.length === 0 && rejected.length > 0) {
    return sendJson(res, 400, { error: { code: 'no_allowed_edits', message: 'None of the requested fields can be edited.', rejected } });
  }

  // Persist
  if (req.context.repositories.trialSites?.updateContent) {
    await req.context.repositories.trialSites.updateContent(site.id, content, (site.version || 0) + 1);
  }

  // Also update tenant branding for public storefront
  if (req.context.repositories.tenantSettings?.upsert) {
    const current = await req.context.repositories.tenantSettings.get(tenantId);
    const brandingPatch = {};
    if (applied.includes('tagline')) brandingPatch.publicTagline = content.tagline;
    if (applied.includes('description')) brandingPatch.publicDescription = content.description;
    if (applied.includes('heroImageUrl')) brandingPatch.heroImageUrl = content.heroImageUrl;
    if (applied.includes('primaryColor')) brandingPatch.primaryColor = content.primaryColor;
    if (applied.includes('secondaryColor')) brandingPatch.secondaryColor = content.secondaryColor;
    if (applied.includes('logoUrl')) brandingPatch.logoUrl = content.logoUrl;
    if (Object.keys(brandingPatch).length > 0) {
      await req.context.repositories.tenantSettings.upsert(tenantId, {
        branding: { ...(current?.branding || {}), ...brandingPatch },
        companyName: content.companyName || current?.companyName
      });
    }
  }

  return sendJson(res, 200, { data: { applied, rejected, version: (site.version || 0) + 1 } });
}

/**
 * GET /api/v1/trial/site/leads
 * List leads attributed to this trial site. Requires auth.
 */
async function listLeads(req, res) {
  const tenantId = req.context.tenantId;

  // Use existing jobs repository (leads come in as jobs from requestService)
  let leads = [];
  try {
    if (req.context.repositories.jobs?.list) {
      const allJobs = await req.context.repositories.jobs.list(tenantId);
      leads = (allJobs || [])
        .filter(j => j.title && j.title.startsWith('Website request:'))
        .map(j => ({
          id: j.id,
          title: j.title.replace('Website request: ', ''),
          status: j.status,
          customerId: j.customerId,
          createdAt: j.createdAt
        }));
    }
  } catch { /* graceful */ }

  return sendJson(res, 200, { data: { leads, total: leads.length } });
}

module.exports = { listOfferings, confirmSelections, getSite, editSite, listLeads };

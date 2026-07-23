const { sendJson } = require('../utils/http');
const { resolveOperationalTenantId } = require('../services/tenantResolver');

const themes = [
  { slug: 'evergreen', name: 'Modern Field Service', config: { primary: '#176b5b', secondary: '#b9e55b' } },
  { slug: 'clean-trades', name: 'Clean Trades', config: { primary: '#155e9a', secondary: '#eef6fb' } },
  { slug: 'corporate-fleet', name: 'Corporate Fleet', config: { primary: '#24364b', secondary: '#e9a23b' } }
];

async function context(req, slug) {
  const settings = await req.context.repositories.tenantSettings.findPublicBySlug(String(slug || '').trim());
  if (!settings) return null;
  const operationalTenant = await resolveOperationalTenantId(req.context.repositories.store, settings.tenantId);
  return { settings, operationalTenant };
}

async function profile(req, res, slug) {
  const value = await context(req, slug);
  if (!value) {
    return sendJson(res, 404, {
      error: {
        code: 'storefront_not_found',
        message: 'This business page is not published. Confirm the storefront URL and publish it in Storefront Builder.'
      }
    });
  }
  const { settings, operationalTenant } = value;
  const branding = settings.branding || {};
  const presentation = branding.publicServicePresentation || {};
  let services = await req.context.repositories.services.list(operationalTenant);
  if (!services.length && String(settings.tenantId) !== String(operationalTenant)) {
    services = await req.context.repositories.services.list(settings.tenantId);
  }
  return sendJson(res, 200, {
    data: {
      slug: branding.publicSlug || slug,
      companyName: settings.companyName,
      contactEmail: settings.supportEmail,
      contactPhone: settings.supportPhone,
      description: branding.publicDescription || '',
      tagline: branding.publicTagline || '',
      serviceArea: branding.publicServiceArea || '',
      hours: branding.publicHours || '',
      logoUrl: branding.logoUrl || '',
      heroImageUrl: branding.heroImageUrl || '/storefront/field-service-hero.png',
      theme: themes.find(item => item.slug === branding.publicTheme) || themes[0],
      services: services
        .filter(item => item.active !== false && (branding.publicServiceIds || []).includes(item.id))
        .map(item => ({
          id: item.id,
          name: presentation[item.id]?.title || item.name,
          description: presentation[item.id]?.description || item.description,
          imageUrl: presentation[item.id]?.imageUrl || '',
          pageHeadline: presentation[item.id]?.pageHeadline || `${presentation[item.id]?.title || item.name} you can depend on`,
          pageBody: presentation[item.id]?.pageBody || `Get dependable ${(presentation[item.id]?.title || item.name).toLowerCase()} from experienced local professionals.`,
          benefits: String(presentation[item.id]?.benefits || '')
            .split('\n').map(value => value.trim()).filter(Boolean),
          startingPrice: item.basePrice
        }))
    }
  });
}

async function requestService(req, res, slug) {
  const value = await context(req, slug);
  if (!value) return sendJson(res, 404, { error: { code: 'storefront_not_found', message: 'Storefront not found' } });
  const { name, email, phone, serviceId, message } = req.body || {};
  if (!name || (!email && !phone) || !message) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'Name, email or phone, and request details are required' } });
  }
  const parts = String(name).trim().split(/\s+/);
  const customer = await req.context.repositories.customers.create(value.operationalTenant, {
    firstName: parts.shift() || 'Prospective',
    lastName: parts.join(' ') || 'Customer',
    email: email || '',
    phone: phone || ''
  });
  const job = await req.context.repositories.jobs.create(value.operationalTenant, {
    customerId: customer.id,
    title: `Website request: ${message}`.slice(0, 180),
    serviceId: serviceId || '',
    status: 'open',
    priority: 'normal'
  });
  return sendJson(res, 201, { data: { requestId: job.id, message: 'Your request has been received.' } });
}

function listThemes(req, res) {
  return sendJson(res, 200, { data: themes });
}

async function starterServices(req, res) {
  const catalog = await req.context.repositories.serviceMarketplace.listCatalog();
  const installations = await req.context.repositories.serviceMarketplace.listInstallations(req.context.tenantId);
  const activeIds = new Set(installations.filter(row => row.status === 'active').map(row => row.itemId));
  const pack = catalog.find(item => item.itemType === 'service_pack' && activeIds.has(item.id));
  const names = pack?.features?.length ? pack.features : ['Consultation', 'Repair service', 'Preventive maintenance'];
  return sendJson(res, 200, {
    data: {
      siteType: pack ? { id: pack.id, name: pack.name, description: pack.description } : null,
      services: names.map((name, index) => ({
        code: `${String(pack?.code || 'service').replace(/^pack-/, '').toUpperCase()}-${index + 1}`,
        name,
        description: `Professional ${name.toLowerCase()} from experienced local service specialists.`
      }))
    }
  });
}

module.exports = { profile, requestService, listThemes, starterServices, themes };

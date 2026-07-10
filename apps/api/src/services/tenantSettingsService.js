function defaultTenantSettings(tenantId = 'tenant_demo') {
  const stamp = new Date().toISOString();
  return {
    tenantId,
    companyName: 'ServicePro Demo Plumbing',
    legalName: 'ServicePro Demo Plumbing LLC',
    supportEmail: 'support@example.com',
    supportPhone: '555-0100',
    timezone: 'America/Indiana/Indianapolis',
    locale: 'en-US',
    currency: 'USD',
    branding: {
      appName: 'ServicePro',
      primaryColor: '#1f4f82',
      logoUrl: '',
      portalWelcomeTitle: 'Welcome to your service portal',
      portalWelcomeMessage: 'Request service, review estimates, and view invoices.'
    },
    features: {
      customerPortal: true,
      estimates: true,
      invoices: true,
      payments: true,
      inventory: true,
      dispatch: true,
      notifications: true,
      reports: true,
      exports: true,
      audit: true
    },
    createdAt: stamp,
    updatedAt: stamp
  };
}

function sanitizeTenantSettings(input = {}) {
  const base = defaultTenantSettings(input.tenantId || 'tenant_demo');
  return {
    ...base,
    ...input,
    branding: {
      ...base.branding,
      ...(input.branding || {})
    },
    features: {
      ...base.features,
      ...(input.features || {})
    }
  };
}

function isFeatureEnabled(settings, featureKey) {
  return Boolean(settings && settings.features && settings.features[featureKey]);
}

function publicTenantProfile(settings) {
  return {
    tenantId: settings.tenantId,
    companyName: settings.companyName,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    timezone: settings.timezone,
    locale: settings.locale,
    currency: settings.currency,
    branding: settings.branding,
    features: settings.features
  };
}

module.exports = { defaultTenantSettings, sanitizeTenantSettings, isFeatureEnabled, publicTenantProfile };

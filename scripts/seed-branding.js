const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const brand = await repos.branding.createBrand(tenantId, {
    name: 'ServicePro Demo',
    legalName: 'ServicePro Demo LLC',
    supportEmail: 'support@example.com',
    supportPhone: '555-0100',
    websiteUrl: 'https://example.com',
    theme: {
      primaryColor: '#0f172a',
      secondaryColor: '#2563eb',
      accentColor: '#22c55e',
      backgroundColor: '#ffffff',
      surfaceColor: '#f8fafc',
      textColor: '#111827',
      mutedTextColor: '#6b7280',
      dangerColor: '#dc2626',
      warningColor: '#d97706',
      successColor: '#16a34a',
      fontFamily: 'Inter, Arial, sans-serif',
      borderRadius: '8px'
    }
  });

  const logo = await repos.branding.createAsset(tenantId, {
    brandId: brand.id,
    assetType: 'logo',
    url: 'https://example.com/assets/logo.svg',
    altText: 'ServicePro Demo'
  });

  const domain = await repos.branding.createDomain(tenantId, {
    brandId: brand.id,
    hostname: 'demo.servicepro.example',
    status: 'verified',
    isPrimary: true,
    verificationToken: 'demo-token',
    verifiedAt: '2026-07-06T00:00:00.000Z',
    sslStatus: 'issued'
  });

  const resolved = await repos.branding.resolve(tenantId, brand.id);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, brand, logo, domain, resolved }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

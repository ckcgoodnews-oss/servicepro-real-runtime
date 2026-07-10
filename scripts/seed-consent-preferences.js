const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const purpose = await repos.consentPreferences.createPurpose({
    tenantId,
    name: 'Product Update Emails',
    purposeType: 'marketing',
    legalBasis: 'consent',
    defaultRetentionDays: 730
  });

  const subject = await repos.consentPreferences.createSubject({
    tenantId,
    email: 'customer@example.com',
    name: 'Customer Example',
    locale: 'en-US',
    country: 'US'
  });

  const consent = await repos.consentPreferences.grantConsent({
    tenantId,
    subjectId: subject.id,
    purposeId: purpose.id,
    source: 'web',
    channel: 'email',
    proofText: 'Checked consent box during signup.',
    expiresAt: '2028-07-07T00:00:00.000Z'
  });

  const preference = await repos.consentPreferences.upsertPreference({
    tenantId,
    subjectId: subject.id,
    preferenceKey: 'email.product_updates',
    value: true,
    updatedBy: 'customer'
  });

  const withdrawn = await repos.consentPreferences.withdrawConsent(consent.id, 'Customer unsubscribed.', 'web');
  const audit = await repos.consentPreferences.auditTrail({ tenantId });
  const metrics = await repos.consentPreferences.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, purpose, subject, consent, preference, withdrawn, audit, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });

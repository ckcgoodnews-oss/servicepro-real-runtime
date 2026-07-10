const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const profile = await repos.trustCenter.createProfile({
    tenantId,
    companyName: 'ServicePro Demo',
    overview: 'ServicePro protects customer data with enterprise-grade controls.',
    securityContactEmail: 'security@example.com',
    privacyContactEmail: 'privacy@example.com',
    certifications: ['SOC 2 Type II'],
    securityHighlights: ['MFA enforced', 'Encryption in transit and at rest']
  });

  const publishedProfile = await repos.trustCenter.publishProfile(profile.id);

  const document = await repos.trustCenter.createDocument({
    tenantId,
    title: 'SOC 2 Type II Report',
    documentType: 'soc2',
    visibility: 'nda_required',
    fileUrl: 's3://trust-center/soc2.pdf',
    version: '2026'
  });

  const publishedDocument = await repos.trustCenter.publishDocument(document.id);

  const request = await repos.trustCenter.createAccessRequest({
    tenantId,
    documentId: document.id,
    requesterName: 'Customer Admin',
    requesterEmail: 'admin@example.com',
    companyName: 'Customer Co',
    businessReason: 'Vendor due diligence'
  });

  const signed = await repos.trustCenter.signNda(request.id);
  const approved = await repos.trustCenter.approveAccessRequest(request.id, 'security@example.com');

  const share = await repos.trustCenter.createShare({
    tenantId,
    documentId: document.id,
    accessRequestId: request.id,
    createdBy: 'security@example.com'
  });

  const viewed = await repos.trustCenter.viewShare(share.id);
  const audit = await repos.trustCenter.auditTrail({ tenantId });
  const metrics = await repos.trustCenter.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, profile: publishedProfile, document: publishedDocument, request: approved, signed, share: viewed, audit, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });

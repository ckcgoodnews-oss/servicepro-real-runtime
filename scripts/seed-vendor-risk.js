const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const vendor = await repos.vendorRisk.createVendor({
    tenantId,
    name: 'Acme Cloud Services',
    criticality: 'high',
    owner: 'security',
    businessUnit: 'platform',
    contactName: 'Vendor Security',
    contactEmail: 'security@acme.example',
    dataAccess: ['customer_profile', 'service_records'],
    regions: ['us-east-2']
  });
  const activeVendor = await repos.vendorRisk.activateVendor(vendor.id);

  const service = await repos.vendorRisk.createService({
    vendorId: vendor.id,
    tenantId,
    name: 'Cloud File Storage',
    serviceType: 'storage',
    processesPersonalData: true,
    dataCategories: ['contact', 'service_records'],
    integrationType: 'api',
    region: 'us-east-2'
  });

  const assessment = await repos.vendorRisk.createAssessment({
    vendorId: vendor.id,
    tenantId,
    assessor: 'security',
    summary: 'Initial vendor review.'
  });
  const submitted = await repos.vendorRisk.submitAssessment(assessment.id, 'security');
  const remediationRequired = await repos.vendorRisk.requireRemediation(assessment.id);

  const attestation = await repos.vendorRisk.createAttestation({
    vendorId: vendor.id,
    assessmentId: assessment.id,
    tenantId,
    documentType: 'soc2'
  });
  const received = await repos.vendorRisk.receiveAttestation(attestation.id, 's3://vendors/acme/soc2.pdf');
  const accepted = await repos.vendorRisk.acceptAttestation(attestation.id, 'security');

  const remediation = await repos.vendorRisk.createRemediation({
    vendorId: vendor.id,
    assessmentId: assessment.id,
    tenantId,
    title: 'Provide updated incident response evidence',
    owner: 'vendor-owner'
  });
  const completedRemediation = await repos.vendorRisk.completeRemediation(remediation.id);
  const approvedAssessment = await repos.vendorRisk.approveAssessment(assessment.id);

  const review = await repos.vendorRisk.createReview({
    vendorId: vendor.id,
    tenantId,
    reviewerId: 'security',
    reviewerName: 'Security'
  });
  const completedReview = await repos.vendorRisk.completeReview(review.id, 'Annual vendor review completed.');

  const metrics = await repos.vendorRisk.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({
    ok: true,
    vendor: activeVendor,
    service,
    assessment: approvedAssessment,
    submitted,
    remediationRequired,
    attestation: accepted,
    received,
    remediation: completedRemediation,
    review: completedReview,
    metrics
  }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
